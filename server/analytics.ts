export interface ClassAnalyticsInput {
  classId?: string | null;
  days?: number | null;
  students: Array<{ user_id: string; student_code: string; class_id: string; data?: any }>;
  submissions: Array<{ id: string; student_id: string | null; class_id: string | null; data: any; created_at: string }>;
  evidence: Array<{ id: string; student_id: string; submission_id: string; skill: string; state: 'needs_remedy' | 'resolved'; reviewed_at: string }>;
  attempts: Array<{ id: string; owner_id: string; lesson_id: string; format: string; data: any; created_at: string }>;
}

export function computeClassAnalytics(input: ClassAnalyticsInput) {
  const cutoffMs = input.days && input.days > 0 ? Date.now() - input.days * 86_400_000 : 0;

  const filteredStudents = input.classId
    ? input.students.filter(s => s.class_id === input.classId)
    : input.students;
  const studentIdSet = new Set(filteredStudents.map(s => s.user_id));

  const validSubmissions = input.submissions.filter(sub => {
    if (input.classId && sub.class_id !== input.classId) return false;
    if (cutoffMs && new Date(sub.created_at).getTime() < cutoffMs) return false;
    // Exclude legacy_unverified from all statistical denominators
    if (sub.data?.legacy_unverified || sub.data?.evaluation?.reviewState === 'legacy_unverified') return false;
    return true;
  });

  const legacyExcludedCount = input.submissions.filter(
    sub => (!input.classId || sub.class_id === input.classId) && (sub.data?.legacy_unverified || sub.data?.evaluation?.reviewState === 'legacy_unverified')
  ).length;

  // Only count 'correct' or 'incorrect' in accuracy denominators; exclude 'inconclusive' and 'not_applicable' (ask_guidance)
  const verifiedGraded = validSubmissions.filter(
    s => s.data?.evaluation?.reviewState === 'verified' && (s.data?.evaluation?.verdict === 'correct' || s.data?.evaluation?.verdict === 'incorrect')
  );
  const verifiedCorrect = verifiedGraded.filter(s => s.data?.evaluation?.verdict === 'correct').length;
  const verifiedIncorrect = verifiedGraded.filter(s => s.data?.evaluation?.verdict === 'incorrect').length;

  const unreviewedCount = validSubmissions.filter(s => s.data?.evaluation?.reviewState === 'unreviewed').length;
  const inconclusiveExcludedCount = validSubmissions.filter(
    s => s.data?.evaluation?.verdict === 'inconclusive' || s.data?.evaluation?.verdict === 'not_applicable'
  ).length;

  const filteredEvidence = input.evidence.filter(e => {
    if (!studentIdSet.has(e.student_id)) return false;
    if (cutoffMs && e.reviewed_at && new Date(e.reviewed_at).getTime() < cutoffMs) return false;
    return true;
  });

  const resolvedEvidenceCount = filteredEvidence.filter(e => e.state === 'resolved').length;
  const totalEvidenceCount = filteredEvidence.length;

  const skillCounts: Record<string, { total: number; unresolved: number; resolved: number }> = {};
  for (const ev of filteredEvidence) {
    const skill = ev.skill || 'Khác';
    if (!skillCounts[skill]) skillCounts[skill] = { total: 0, unresolved: 0, resolved: 0 };
    skillCounts[skill].total++;
    if (ev.state === 'resolved') skillCounts[skill].resolved++;
    else skillCounts[skill].unresolved++;
  }

  const errorDistribution = Object.entries(skillCounts)
    .map(([skill, stats]) => ({
      skill,
      total: stats.total,
      unresolved: stats.unresolved,
      resolved: stats.resolved,
      percentageOfVerifiedErrors: totalEvidenceCount > 0 ? Number(((stats.total / totalEvidenceCount) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const filteredAttempts = input.attempts.filter(a => {
    if (!studentIdSet.has(a.owner_id)) return false;
    if (cutoffMs && new Date(a.created_at).getTime() < cutoffMs) return false;
    return a.data?.submitted && a.data?.result;
  });

  const avgAttemptScore =
    filteredAttempts.length > 0
      ? Number((filteredAttempts.reduce((acc, a) => acc + Number(a.data?.result?.score ?? 0), 0) / filteredAttempts.length).toFixed(2))
      : null;

  const studentsNeedingSupport = filteredStudents
    .map(stu => {
      const stuEvidence = filteredEvidence.filter(e => e.student_id === stu.user_id && e.state === 'needs_remedy');
      const stuSubSelfCorrected = validSubmissions.filter(
        s => s.student_id === stu.user_id && s.data?.workflowState === 'self_correction_submitted' && !s.data?.hasResolvedMistake
      ).length;
      const stuAttempts = filteredAttempts.filter(a => a.owner_id === stu.user_id);
      const stuAvg =
        stuAttempts.length > 0
          ? Number((stuAttempts.reduce((acc, a) => acc + Number(a.data?.result?.score ?? 0), 0) / stuAttempts.length).toFixed(1))
          : null;
      return {
        studentId: stu.user_id,
        studentCode: stu.student_code,
        name: stu.data?.name || stu.student_code,
        classId: stu.class_id,
        unresolvedGaps: stuEvidence.length,
        pendingSelfCorrections: stuSubSelfCorrected,
        attemptCount: stuAttempts.length,
        averageAttemptScore: stuAvg,
      };
    })
    .filter(s => s.unresolvedGaps > 0 || s.pendingSelfCorrections > 0 || (s.averageAttemptScore !== null && s.averageAttemptScore < 6.0))
    .sort((a, b) => b.unresolvedGaps - a.unresolvedGaps);

  return {
    sourceLabel: 'Thống kê theo quy tắc (Rule-based — chỉ tính dữ liệu đã xác thực, loại trừ hỏi gợi ý, chưa kết luận và dữ liệu cũ chưa kiểm chứng)',
    filters: {
      classId: input.classId || 'all',
      days: input.days || null,
    },
    denominators: {
      verifiedAccuracy: {
        numerator: verifiedCorrect,
        denominator: verifiedGraded.length,
        ratePercent: verifiedGraded.length > 0 ? Number(((verifiedCorrect / verifiedGraded.length) * 100).toFixed(1)) : null,
        label: 'Tỉ lệ bài nộp đúng trên tổng số bài nộp đã được giáo viên thẩm định (Đúng / (Đúng + Sai))',
      },
      errorResolution: {
        numerator: resolvedEvidenceCount,
        denominator: totalEvidenceCount,
        ratePercent: totalEvidenceCount > 0 ? Number(((resolvedEvidenceCount / totalEvidenceCount) * 100).toFixed(1)) : null,
        label: 'Tỉ lệ lỗi đã khắc phục trên tổng số bằng chứng lỗi đã xác thực (Resolved / Tổng lỗi xác thực)',
      },
      exclusions: {
        unreviewedAiCount: unreviewedCount,
        inconclusiveOrGuidanceExcludedCount: inconclusiveExcludedCount,
        legacyUnverifiedExcludedCount: legacyExcludedCount,
        verifiedIncorrectCount: verifiedIncorrect,
      },
    },
    practiceAttempts: {
      submittedCount: filteredAttempts.length,
      averageScore: avgAttemptScore,
    },
    errorDistribution,
    studentsNeedingSupport,
  };
}
