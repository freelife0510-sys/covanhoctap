import { neon } from '@neondatabase/serverless';
import { HttpError } from './http.ts';

/**
 * Durable JSON document store on Postgres (Neon). Every record is a JSONB
 * document addressed by key and guarded by an optimistic `version`, so the
 * standalone workspace survives cold starts, redeploys and multiple instances.
 */
export interface StoredDoc {
  key: string;
  data: any;
  version: number;
}

export interface DocWrite {
  key: string;
  data: unknown;
  /** Version read before modifying; null means "create, must not exist yet". */
  version: number | null;
}

const databaseUrl = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

export const isDurableStoreConfigured = (): boolean => Boolean(databaseUrl());

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaReady: Promise<void> | null = null;

function sql() {
  if (!sqlClient) sqlClient = neon(databaseUrl());
  return sqlClient;
}

async function ready() {
  if (!schemaReady) {
    schemaReady = sql()
      .query(
        `create table if not exists cv_docs (
          key text primary key,
          data jsonb not null,
          version integer not null default 1,
          updated_at timestamptz not null default now()
        )`
      )
      .then(() => undefined)
      .catch(error => {
        schemaReady = null;
        throw error;
      });
  }
  await schemaReady;
}

async function run<T = any>(text: string, params: unknown[] = []): Promise<T[]> {
  try {
    await ready();
    return (await sql().query(text, params)) as T[];
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error(JSON.stringify({ code: 'STORE_ERROR', message: (error as Error)?.message?.slice(0, 200) }));
    throw new HttpError(503, 'DATABASE_ERROR', 'Không lưu/đọc được dữ liệu máy chủ. Vui lòng thử lại.', true);
  }
}

/** Load documents by exact keys and/or key prefixes in a single round trip. */
export async function loadDocs(keys: string[], prefixes: string[] = []): Promise<StoredDoc[]> {
  const likes = prefixes.map(p => `${p.replace(/[\\%_]/g, m => `\\${m}`)}%`);
  return run<StoredDoc>('select key, data, version from cv_docs where key = any($1::text[]) or key like any($2::text[])', [keys, likes]);
}

export async function getDoc(key: string): Promise<StoredDoc | null> {
  return (await loadDocs([key]))[0] || null;
}

export async function existingKeys(keys: string[]): Promise<Set<string>> {
  if (!keys.length) return new Set();
  const rows = await run<{ key: string }>('select key from cv_docs where key = any($1::text[])', [keys]);
  return new Set(rows.map(r => r.key));
}

/** Insert documents that do not exist yet; existing keys are left untouched. Returns keys written. */
export async function insertIfAbsent(docs: { key: string; data: unknown }[]): Promise<Set<string>> {
  if (!docs.length) return new Set();
  const rows = await run<{ key: string }>(
    `insert into cv_docs (key, data)
     select x.key, x.data from jsonb_to_recordset($1::jsonb) as x(key text, data jsonb)
     on conflict (key) do nothing returning key`,
    [JSON.stringify(docs)]
  );
  return new Set(rows.map(r => r.key));
}

export async function upsertDoc(key: string, data: unknown): Promise<void> {
  await run(
    `insert into cv_docs (key, data) values ($1, $2::jsonb)
     on conflict (key) do update set data = excluded.data, version = cv_docs.version + 1, updated_at = now()`,
    [key, JSON.stringify(data)]
  );
}

/**
 * Write all documents only if every version still matches what was read.
 * Returns false (and writes nothing) when another request changed one of them.
 */
export async function writeDocsIfUnchanged(writes: DocWrite[]): Promise<boolean> {
  if (!writes.length) return true;
  const rows = await run<{ fine: boolean; written: number }>(
    `with input as (
       select * from jsonb_to_recordset($1::jsonb) as x(key text, data jsonb, version integer)
     ),
     ok as (
       select bool_and((i.version is null and d.key is null) or (i.version is not null and d.version = i.version)) as fine
       from input i left join cv_docs d on d.key = i.key
     ),
     ins as (
       insert into cv_docs (key, data)
       select i.key, i.data from input i where i.version is null and (select fine from ok)
       on conflict (key) do nothing returning key
     ),
     upd as (
       update cv_docs d set data = i.data, version = d.version + 1, updated_at = now()
       from input i
       where d.key = i.key and i.version is not null and d.version = i.version and (select fine from ok)
       returning d.key
     )
     select (select fine from ok) as fine, ((select count(*) from ins) + (select count(*) from upd))::int as written`,
    [JSON.stringify(writes.map(w => ({ key: w.key, data: w.data, version: w.version })))]
  );
  const result = rows[0];
  return Boolean(result?.fine) && Number(result?.written) === writes.length;
}
