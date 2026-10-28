import { z } from 'zod';

const allowed = new Set([
  'doc',
  'paragraph',
  'text',
  'heading',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'hardBreak',
  'horizontalRule',
  'codeBlock',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'image',
  'inlineMath',
  'blockMath',
  'pageBreak',
]);

export function validateDocument(value: unknown): boolean {
  let nodes = 0;
  const visit = (node: any, depth: number): boolean => {
    if (++nodes > 10000 || depth > 40 || !node || typeof node !== 'object' || !allowed.has(node.type)) return false;
    if (node.text !== undefined && (typeof node.text !== 'string' || node.text.length > 100000)) return false;
    if (node.attrs) {
      for (const [key, v] of Object.entries(node.attrs)) {
        if (!['id', 'nodeId', 'level', 'start', 'language', 'colspan', 'rowspan', 'colwidth', 'latex', 'src', 'alt', 'title', 'width', 'height', 'textAlign'].includes(key))
          return false;
        if (['src'].includes(key) && !(typeof v === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 350000))
          return false;
        if (key === 'latex' && (typeof v !== 'string' || v.length > 10000)) return false;
        if (key === 'nodeId' && v !== null && v !== undefined && (typeof v !== 'string' || v.length > 100)) return false;
      }
    }
    if (
      node.marks &&
      (!Array.isArray(node.marks) ||
        node.marks.some(
          (m: any) => !['bold', 'italic', 'strike', 'underline', 'code', 'link'].includes(m.type) || (m.type === 'link' && !/^https:\/\//.test(m.attrs?.href || ''))
        ))
    )
      return false;
    return !node.content || (Array.isArray(node.content) && node.content.every((n: any) => visit(n, depth + 1)));
  };
  return visit(value, 0) && (value as any).type === 'doc';
}

export function ensureNodeIds(doc: Record<string, any>): Record<string, any> {
  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) return doc;
  let idx = 0;
  return {
    ...doc,
    content: doc.content.map((node: any) => {
      idx++;
      if (!node || typeof node !== 'object' || node.type === 'pageBreak') return node;
      const existingId = node.attrs?.nodeId || node.attrs?.id;
      const nodeId = typeof existingId === 'string' && existingId.trim() ? existingId : `block-${idx}`;
      return {
        ...node,
        attrs: { ...(node.attrs || {}), nodeId },
      };
    }),
  };
}

export function applyDocumentNodePatch(
  doc: Record<string, any>,
  expectedRevision: number,
  currentRevision: number,
  targetNodeId: string,
  replacementNode: Record<string, any>
): { ok: true; document: Record<string, any> } | { ok: false; reason: 'REVISION_CONFLICT' | 'NODE_NOT_FOUND' | 'INVALID_NODE' } {
  if (expectedRevision !== currentRevision) {
    return { ok: false, reason: 'REVISION_CONFLICT' };
  }
  const normalized = ensureNodeIds(doc);
  if (!Array.isArray(normalized.content)) {
    return { ok: false, reason: 'NODE_NOT_FOUND' };
  }
  let found = false;
  const updatedContent = normalized.content.map((node: any) => {
    const id = node?.attrs?.nodeId || node?.attrs?.id;
    if (id === targetNodeId) {
      found = true;
      return {
        ...replacementNode,
        attrs: { ...(replacementNode.attrs || {}), nodeId: targetNodeId },
      };
    }
    return node;
  });
  if (!found) return { ok: false, reason: 'NODE_NOT_FOUND' };
  const candidate = { ...normalized, content: updatedContent };
  if (!validateDocument(candidate)) return { ok: false, reason: 'INVALID_NODE' };
  return { ok: true, document: candidate };
}

export const contentSchema = z.record(z.string(), z.unknown()).refine(validateDocument, 'Invalid document structure');
