import { createHash } from 'node:crypto';
import type { Identity } from './auth.ts';
import { checked, supabase } from './auth.ts';
import { HttpError } from './http.ts';
import { ensureNodeIds, validateDocument } from '../shared/document.ts';
import { legacyImportRequestSchema, uuid } from '../shared/contracts.ts';

export function legacyUuid(teacherId: string, kind: string, legacyId: string): string {
  const hex = createHash('sha256').update(`${teacherId}:${kind}:${legacyId}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function computeLegacyChecksum(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return createHash('sha256').update(canonical).digest('hex');
}

export interface LegacyReconciliationPlan {
  checksum: string;
  summary: {
    classesValid: number;
    classesRejected: number;
    submissionsValid: number;
    submissionsRejected: number;
    documentsValid: number;
    documentsRejected: number;
    studentAccountsSkippedForSecurity: number;
  };
  warnings: string[];
  classesToInsert: Array<{ id: string; teacher_id: string; data: Record<string, any> }>;
  submissionsToInsert: Array<{
    id: string;
    student_id: string | null;
    teacher_id: string;
    class_id: string | null;
    data: Record<string, any>;
  }>;
  documentsToInsert: Array<{ id: string; owner_id: string; revision: number; title: string; content: Record<string, any> }>;
}

export function prepareLegacyImport(teacherId: string, rawPayload: Record<string, unknown>): LegacyReconciliationPlan {
  const checksum = computeLegacyChecksum(rawPayload);
  const warnings: string[] = [];

  const rawClasses = Array.isArray(rawPayload.math_ai_classes_v1) ? rawPayload.math_ai_classes_v1 : [];
  const rawAccounts = Array.isArray(rawPayload.math_ai_student_accounts_v2) ? rawPayload.math_ai_student_accounts_v2 : [];
  const rawSubmissions = Array.isArray(rawPayload.math_ai_submissions_v1) ? rawPayload.math_ai_submissions_v1 : [];
  const rawDocs = Array.isArray(rawPayload.saved_math_documents) ? rawPayload.saved_math_documents : [];

  if (rawAccounts.length > 0) {
    warnings.push(
      `Đã bỏ qua ${rawAccounts.length} tài khoản học sinh cũ (math_ai_student_accounts_v2) vì chứa mật khẩu văn bản thuần; vui lòng tạo lại qua trình quản lý lớp để cấp mật khẩu băm an toàn.`
    );
  }

  const classesToInsert: LegacyReconciliationPlan['classesToInsert'] = [];
  let classesRejected = 0;
  const classIdMap = new Map<string, string>();

  for (const item of rawClasses) {
    if (!item || typeof item !== 'object' || typeof (item as any).name !== 'string' || !(item as any).name.trim()) {
      classesRejected++;
      continue;
    }
    const c = item as Record<string, any>;
    const oldId = String(c.id || c.classCode || c.name).trim();
    const mappedId = legacyUuid(teacherId, 'class', oldId);
    classIdMap.set(oldId, mappedId);
    const grade = ['10', '11', '12'].includes(String(c.grade)) ? String(c.grade) : '12';
    classesToInsert.push({
      id: mappedId,
      teacher_id: teacherId,
      data: {
        id: mappedId,
        name: String(c.name).trim().slice(0, 100),
        grade,
        academicYear: String(c.academicYear || '2025-2026').slice(0, 30),
        classCode: String(c.classCode || oldId).slice(0, 40),
        notes: c.notes ? String(c.notes).slice(0, 2000) : 'Nhập từ bản sao lưu trình duyệt cũ',
        legacySourceId: oldId,
      },
    });
  }

  const submissionsToInsert: LegacyReconciliationPlan['submissionsToInsert'] = [];
  let submissionsRejected = 0;

  for (const item of rawSubmissions) {
    if (!item || typeof item !== 'object') {
      submissionsRejected++;
      continue;
    }
    const s = item as Record<string, any>;
    const oldId = String(s.id || '').trim();
    if (!oldId) {
      submissionsRejected++;
      continue;
    }
    const mappedId = legacyUuid(teacherId, 'submission', oldId);
    const mappedClassId = s.classId && classIdMap.has(String(s.classId)) ? classIdMap.get(String(s.classId))! : null;

    // Never trust legacy verdict/score as verified; always mark legacy_unverified
    submissionsToInsert.push({
      id: mappedId,
      student_id: null,
      teacher_id: teacherId,
      class_id: mappedClassId,
      data: {
        id: mappedId,
        legacySourceId: oldId,
        legacyStudentName: typeof s.studentName === 'string' ? s.studentName.slice(0, 100) : 'Học sinh (Bản ghi cũ)',
        legacy_unverified: true,
        source: 'legacy_import',
        problemText: typeof s.problemText === 'string' ? s.problemText.slice(0, 10000) : '',
        evaluation: {
          verdict: 'inconclusive',
          reviewState: 'legacy_unverified',
          errorCategory: null,
          chatReply:
            typeof s.evaluation?.chatReply === 'string'
              ? s.evaluation.chatReply.slice(0, 10000)
              : 'Bản ghi nhập từ localStorage cũ (chưa xác thực).',
        },
        hasResolvedMistake: false,
      },
    });
  }

  const documentsToInsert: LegacyReconciliationPlan['documentsToInsert'] = [];
  let documentsRejected = 0;

  for (const item of rawDocs) {
    if (!item || typeof item !== 'object') {
      documentsRejected++;
      continue;
    }
    const d = item as Record<string, any>;
    const oldId = String(d.id || d.title || '').trim();
    const title = typeof d.title === 'string' && d.title.trim() ? d.title.trim().slice(0, 200) : 'Tài liệu cũ';
    if (!oldId) {
      documentsRejected++;
      continue;
    }
    const mappedId = legacyUuid(teacherId, 'document', oldId);
    let content: Record<string, any>;
    if (d.content && typeof d.content === 'object' && validateDocument(d.content)) {
      content = ensureNodeIds(d.content);
    } else {
      const rawText = typeof d.content === 'string' ? d.content : typeof d.text === 'string' ? d.text : '';
      const paragraphs = rawText
        .split(/\r?\n/)
        .filter(Boolean)
        .slice(0, 200)
        .map(line => ({
          type: 'paragraph',
          content: [{ type: 'text', text: line.slice(0, 5000) }],
        }));
      content = ensureNodeIds({
        type: 'doc',
        content: paragraphs.length ? paragraphs : [{ type: 'paragraph', content: [{ type: 'text', text: title }] }],
      });
    }
    if (!validateDocument(content)) {
      documentsRejected++;
      continue;
    }
    documentsToInsert.push({
      id: mappedId,
      owner_id: teacherId,
      revision: 1,
      title,
      content,
    });
  }

  return {
    checksum,
    summary: {
      classesValid: classesToInsert.length,
      classesRejected,
      submissionsValid: submissionsToInsert.length,
      submissionsRejected,
      documentsValid: documentsToInsert.length,
      documentsRejected,
      studentAccountsSkippedForSecurity: rawAccounts.length,
    },
    warnings,
    classesToInsert,
    submissionsToInsert,
    documentsToInsert,
  };
}

export async function handleLegacyImport(identity: Identity, rawBody: unknown) {
  if (identity.role !== 'teacher') {
    throw new HttpError(403, 'FORBIDDEN', 'Chỉ giáo viên mới được nhập dữ liệu sao lưu.');
  }
  const input = legacyImportRequestSchema.parse(rawBody);
  const plan = prepareLegacyImport(identity.id, input.payload);

  if (input.mode === 'preview') {
    return {
      mode: 'preview',
      checksum: plan.checksum,
      summary: plan.summary,
      warnings: plan.warnings,
    };
  }

  const admin = supabase(undefined, true);
  const existingBatch = checked(
    await admin
      .from('import_batches')
      .select('*')
      .eq('teacher_id', identity.id)
      .eq('source_checksum', plan.checksum)
      .eq('status', 'imported')
      .maybeSingle()
  );

  if (existingBatch) {
    return {
      mode: 'commit',
      idempotent: true,
      batchId: existingBatch.id,
      checksum: plan.checksum,
      summary: existingBatch.summary,
      warnings: plan.warnings,
    };
  }

  const importedClassIds: string[] = [];
  const importedSubmissionIds: string[] = [];
  const importedDocumentIds: string[] = [];

  for (const cls of plan.classesToInsert) {
    const existing = checked(await admin.from('classes').select('id').eq('id', cls.id).maybeSingle());
    if (!existing) {
      checked(await admin.from('classes').insert(cls));
      importedClassIds.push(cls.id);
    }
  }

  for (const sub of plan.submissionsToInsert) {
    const existing = checked(await admin.from('submissions').select('id').eq('id', sub.id).maybeSingle());
    if (!existing) {
      checked(await admin.from('submissions').insert(sub));
      importedSubmissionIds.push(sub.id);
    }
  }

  for (const doc of plan.documentsToInsert) {
    const existing = checked(await admin.from('documents').select('id').eq('id', doc.id).maybeSingle());
    if (!existing) {
      checked(await admin.from('documents').insert(doc));
      importedDocumentIds.push(doc.id);
    }
  }

  const batchId = crypto.randomUUID();
  const importedIds = {
    classes: importedClassIds,
    submissions: importedSubmissionIds,
    documents: importedDocumentIds,
  };

  checked(
    await admin.from('import_batches').insert({
      id: batchId,
      teacher_id: identity.id,
      source_checksum: plan.checksum,
      status: 'imported',
      summary: plan.summary,
      imported_ids: importedIds,
    })
  );

  return {
    mode: 'commit',
    idempotent: false,
    batchId,
    checksum: plan.checksum,
    summary: plan.summary,
    importedIds,
    warnings: plan.warnings,
  };
}

export async function rollbackLegacyImport(identity: Identity, batchIdRaw: unknown) {
  if (identity.role !== 'teacher') {
    throw new HttpError(403, 'FORBIDDEN', 'Chỉ giáo viên mới được hoàn tác lô nhập dữ liệu.');
  }
  const batchId = uuid.parse(batchIdRaw);
  const admin = supabase(undefined, true);
  const batch = checked(
    await admin.from('import_batches').select('*').eq('id', batchId).eq('teacher_id', identity.id).maybeSingle()
  );
  if (!batch) {
    throw new HttpError(404, 'BATCH_NOT_FOUND', 'Không tìm thấy lô nhập dữ liệu.');
  }
  if (batch.status === 'rolled_back') {
    return { batchId, status: 'rolled_back', alreadyRolledBack: true };
  }

  const ids = batch.imported_ids || {};
  if (Array.isArray(ids.submissions) && ids.submissions.length > 0) {
    checked(await admin.from('submissions').delete().eq('teacher_id', identity.id).in('id', ids.submissions));
  }
  if (Array.isArray(ids.documents) && ids.documents.length > 0) {
    checked(await admin.from('documents').delete().eq('owner_id', identity.id).in('id', ids.documents));
  }
  if (Array.isArray(ids.classes) && ids.classes.length > 0) {
    checked(await admin.from('classes').delete().eq('teacher_id', identity.id).in('id', ids.classes));
  }

  checked(
    await admin
      .from('import_batches')
      .update({ status: 'rolled_back', rolled_back_at: new Date().toISOString() })
      .eq('id', batchId)
      .eq('teacher_id', identity.id)
  );

  return { batchId, status: 'rolled_back', rolledBackIds: ids };
}
