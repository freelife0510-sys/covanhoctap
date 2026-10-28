import { test, expect } from '@playwright/test';

const teacher = {
  profile: {
    user_id: '10000000-0000-4000-8000-000000000001',
    role: 'teacher',
    name: 'Giáo viên kiểm thử',
    school: '',
    forced_password_change: false,
  },
  student: null,
};

const learner = {
  profile: {
    user_id: '20000000-0000-4000-8000-000000000001',
    role: 'student',
    name: 'Học sinh kiểm thử',
    school: '',
    forced_password_change: false,
  },
  student: {
    user_id: '20000000-0000-4000-8000-000000000001',
    student_code: 'HS-TEST',
    class_id: '30000000-0000-4000-8000-000000000001',
    data: { name: 'Học sinh kiểm thử' },
  },
};

test('real app: landing, student login validation and honest missing-server error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Cố Vấn Học Tập', exact: true })).toBeVisible();
  await expect(page.getByText('1,240')).toHaveCount(0);
  await expect(page.getByText('50,000+')).toHaveCount(0);
  await page.getByRole('button', { name: 'Đăng nhập học sinh', exact: true }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Mã học sinh', { exact: true }).fill('HS-TEST');
  await page.getByLabel('Mật khẩu', { exact: true }).fill('not-a-real-password');
  await page.getByRole('dialog').getByRole('button', { name: /^Đăng nhập/ }).click();
  await expect(page.getByRole('alert').first()).toContainText('chưa cấu hình');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(errors).toEqual([]);
});

test('real app: 1-click teacher Google continue logs in immediately without requiring OAuth Client ID', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Đăng nhập bằng Google (Giáo viên)' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('freelife0510@gmail.com')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Tiếp tục', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: /Quản lý lớp · Thầy Hồ Sỹ Long/ })).toBeVisible();
});

test('UI contract mock: empty teacher workspace has no seeded students or plaintext passwords', async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: teacher }));
  await page.route('**/api/workspace', route => route.fulfill({ json: { classes: [], students: [], submissions: [], assignments: [] } }));
  await page.goto('/');
  await expect(page.getByText('0 lớp · 0 học sinh · 0 bài nộp.')).toBeVisible();
  await page.getByRole('button', { name: 'Bài nộp', exact: true }).click();
  await expect(page.getByText('Chưa có bài nộp.')).toBeVisible();
});

test('UI contract mock: teacher analytics and legacy localStorage preview/reconciliation', async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: teacher }));
  await page.route('**/api/workspace', route => route.fulfill({ json: { classes: [], students: [], submissions: [], assignments: [] } }));
  await page.route('**/api/analytics/class**', route =>
    route.fulfill({
      json: {
        sourceLabel: 'Thống kê theo quy tắc (Rule-based)',
        denominators: {
          verifiedAccuracy: { numerator: 3, denominator: 4, ratePercent: 75, label: 'Đúng / (Đúng + Sai)' },
          errorResolution: { numerator: 1, denominator: 2, ratePercent: 50, label: 'Resolved / Tổng lỗi' },
          exclusions: { unreviewedAiCount: 2, inconclusiveOrGuidanceExcludedCount: 1, legacyUnverifiedExcludedCount: 1 },
        },
      },
    })
  );
  await page.route('**/api/import/legacy', route =>
    route.fulfill({
      json: {
        mode: 'preview',
        checksum: 'abcdef1234567890',
        summary: {
          classesValid: 1,
          classesRejected: 0,
          submissionsValid: 2,
          submissionsRejected: 0,
          documentsValid: 1,
          documentsRejected: 0,
          studentAccountsSkippedForSecurity: 3,
        },
        warnings: ['Đã bỏ qua 3 tài khoản học sinh cũ vì chứa mật khẩu văn bản thuần.'],
      },
    })
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Phân tích & Sao lưu', exact: true }).click();
  await expect(page.getByText('3/4 (75%)')).toBeVisible();
  await expect(page.getByText('1/2 (50%)')).toBeVisible();
  await page.getByPlaceholder(/math_ai_classes_v1/).fill('{"math_ai_classes_v1":[{"id":"c1","name":"12A1"}]}');
  await page.getByRole('button', { name: /Xem trước & Đối soát/ }).click();
  await expect(page.getByText(/Lớp hợp lệ: 1/)).toBeVisible();
  await expect(page.getByText(/mật khẩu văn bản thuần/)).toBeVisible();
});

test('learner is told when server-side Gemini configuration is missing', async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: learner }));
  await page.route('**/api/ai/status', route => route.fulfill({ json: { available: false } }));
  await page.route('**/api/conversations', route => route.fulfill({ json: [] }));
  await page.route('**/api/workspace', route => route.fulfill({ json: { classes: [], students: [], submissions: [], assignments: [] } }));
  await page.route('**/api/messages**', route => route.fulfill({ json: [] }));
  await page.goto('/');
  await expect(page.getByRole('status').filter({ hasText: 'AI chưa được kết nối' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Xin chào, Học sinh kiểm thử' })).toBeVisible();
});

test('UI contract mock: editor changes persist with revision and produces real DOCX download', async ({ page }) => {
  await page.route('**/api/session', route => route.fulfill({ json: teacher }));
  await page.route('**/api/workspace', route => route.fulfill({ json: { classes: [], students: [], submissions: [], assignments: [] } }));
  let saved: any = null;
  await page.route('**/api/documents', async route => {
    if (route.request().method() === 'POST') {
      saved = route.request().postDataJSON();
      await route.fulfill({ json: { revision: saved.revision + 1 } });
    } else await route.fulfill({ json: saved ? [{ ...saved, revision: saved.revision + 1 }] : [] });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Soạn tài liệu A4' }).click();
  await page.getByRole('textbox', { name: 'Nội dung tài liệu' }).fill('Tài liệu kiểm thử tiếng Việt');
  await page.getByRole('button', { name: 'Lưu', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Đã lưu');
  expect(saved.content.content[0].content[0].text).toContain('tiếng Việt');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Tải DOCX', exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.docx$/);
});
