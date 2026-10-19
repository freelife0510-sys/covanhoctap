/**
 * MathDiagnostic AI - Storage & Multi-Teacher Authentication Service
 * Hỗ trợ lưu trữ bền vững (localStorage), cách ly dữ liệu giữa các giáo viên,
 * đăng nhập Google (kèm Smart Fallback), và đăng nhập học sinh bằng Mã/Tên + Mật khẩu.
 */

import {
  AuthSession,
  ClassRoom,
  MathSubmission,
  StudentAccount,
  Teacher,
  TestHistoryItem,
} from '../types/index.ts';
import { INITIAL_SUBMISSIONS } from '../data/mockData.ts';

const STORAGE_KEYS = {
  AUTH_SESSION: 'math_auth_session',
  TEACHERS: 'math_teachers_db',
  CLASSES_PREFIX: 'math_classes_teacher_',
  STUDENTS_PREFIX: 'math_students_class_',
  SUBMISSIONS_PREFIX: 'math_submissions_class_',
  GLOBAL_STUDENTS: 'math_global_students_db',
};

// Chuẩn hóa chuỗi (bỏ khoảng trắng thừa, đưa về chữ thường không dấu hoặc giữ nguyên chuẩn)
export function normalizeString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Tạo ID ngẫu nhiên tiện lợi
export function generateRandomId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
}

// Tạo mật khẩu ngẫu nhiên dễ nhớ cho học sinh
export function generateRandomPassword(length: number = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ----------------------------------------------------
// DỮ LIỆU MẪU DÀNH CHO GIÁO VIÊN TRẢI NGHIỆM LẦN ĐẦU
// ----------------------------------------------------
export function createSampleDataForTeacher(teacher: Teacher): {
  classes: ClassRoom[];
  students: StudentAccount[];
  submissions: MathSubmission[];
} {
  const sampleClassId = `class-${teacher.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}-12a1`;
  
  const sampleClass: ClassRoom = {
    id: sampleClassId,
    teacherId: teacher.id,
    name: 'Lớp 12A1 (Toán THPT Chuẩn 2018)',
    grade: '12',
    academicYear: '2025 - 2026',
    classCode: '12A1-MAT',
    studentCount: 5,
    notes: 'Lớp trải nghiệm mẫu với 5 học sinh đã có phân tích vùng trũng kiến thức Toán GDPT 2018.',
    createdAt: new Date().toLocaleDateString('vi-VN'),
  };

  const sampleStudents: StudentAccount[] = [
    {
      id: 'HS12A1-01',
      studentCode: 'HS12A1-01',
      name: 'Nguyễn Văn An',
      classId: sampleClassId,
      className: sampleClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=An',
      school: teacher.school || 'THPT Chuyên',
      status: 'needs_remedy',
      latestScore: 5.5,
      gapsCount: 2,
      detectedGaps: [
        'Chưa đặt điều kiện xác định căn thức (Lớp 12 - Thông hiểu)',
        'Bỏ sót nghiệm ngoại lai khi giải phương trình vô tỉ',
      ],
      notesFromTeacher: 'Em cần ôn tập lại bước đặt điều kiện xác định vế phải trước khi bình phương hai vế phương trình vô tỉ.',
      assignedTasks: [
        {
          id: 'task-1',
          title: 'Luyện 5 câu phương trình vô tỉ có nghiệm ngoại lai',
          topic: 'Phương trình vô tỉ',
          deadline: '25/10/2026',
          completed: false,
          assignedAt: '18/10/2026',
          notes: 'Chú ý điều kiện vế phải $x \\ge a$',
        },
      ],
      testHistory: [
        {
          id: 'test-101',
          date: '17/10/2026 14:30',
          score: 5.5,
          durationMinutes: 25,
          correctAnswers: 3,
          totalQuestions: 6,
          gapsDetected: ['Chưa đặt điều kiện xác định'],
          details: [
            {
              questionId: 1,
              problem: 'Giải phương trình: $\\sqrt{x - 2} = x - 4$',
              studentAnswer: 'x = 6; x = 3',
              isCorrect: false,
              note: 'Quên đối chiếu ĐK $x - 4 \\ge 0 \\Rightarrow x \\ge 4$. Loại $x = 3$.',
            },
            {
              questionId: 2,
              problem: 'Tính đạo hàm hàm số $y = \\ln(x^2 + 1)$',
              studentAnswer: "$y' = \\frac{2x}{x^2 + 1}$",
              isCorrect: true,
            },
          ],
        },
      ],
      createdAt: '18/10/2026',
    },
    {
      id: 'HS12A1-02',
      studentCode: 'HS12A1-02',
      name: 'Trần Thị Mai',
      classId: sampleClassId,
      className: sampleClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Mai',
      school: teacher.school || 'THPT Chuyên',
      status: 'diagnosed',
      latestScore: 8.5,
      gapsCount: 1,
      detectedGaps: ['Nhầm lẫn định thức đạo hàm phân thức bậc nhất trên bậc nhất'],
      notesFromTeacher: 'Lập luận sắc sảo, cần cẩn thận dấu âm của hệ số tự do.',
      assignedTasks: [
        {
          id: 'task-2',
          title: 'Khảo sát sự biến thiên hàm phân thức hữu tỉ nâng cao',
          topic: 'Ứng dụng đạo hàm',
          deadline: '26/10/2026',
          completed: true,
          assignedAt: '17/10/2026',
        },
      ],
      testHistory: [
        {
          id: 'test-102',
          date: '16/10/2026 09:15',
          score: 8.5,
          durationMinutes: 20,
          correctAnswers: 5,
          totalQuestions: 6,
          gapsDetected: ['Biến đổi đại số sai'],
        },
      ],
      createdAt: '18/10/2026',
    },
    {
      id: 'HS12A1-03',
      studentCode: 'HS12A1-03',
      name: 'Lê Hoàng Long',
      classId: sampleClassId,
      className: sampleClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Long',
      school: teacher.school || 'THPT Chuyên',
      status: 'diagnosed',
      latestScore: 7.0,
      gapsCount: 2,
      detectedGaps: [
        'Nhầm lẫn vị trí tiệm cận đứng và tiệm cận ngang',
        'Sai công thức diện tích hình phẳng ứng dụng tích phân',
      ],
      notesFromTeacher: 'Cần vẽ phác đồ thị trước khi áp dụng công thức tích phân tính diện tích.',
      assignedTasks: [],
      testHistory: [
        {
          id: 'test-103',
          date: '15/10/2026 16:00',
          score: 7.0,
          durationMinutes: 30,
          correctAnswers: 4,
          totalQuestions: 6,
          gapsDetected: ['Nhầm lẫn định lý/công thức'],
        },
      ],
      createdAt: '18/10/2026',
    },
    {
      id: 'HS12A1-04',
      studentCode: 'HS12A1-04',
      name: 'Phạm Minh Quân',
      classId: sampleClassId,
      className: sampleClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Quan',
      school: teacher.school || 'THPT Chuyên',
      status: 'not_started',
      latestScore: undefined,
      gapsCount: 0,
      detectedGaps: [],
      notesFromTeacher: 'Chưa tham gia bài chẩn đoán đầu năm. Nhắc em hoàn thành trên hệ thống.',
      assignedTasks: [
        {
          id: 'task-3',
          title: 'Hoàn thành bài kiểm tra chẩn đoán năng lực đầu vào Khối 12',
          topic: 'Tổng ôn tập GDPT 2018',
          deadline: '24/10/2026',
          completed: false,
          assignedAt: '18/10/2026',
        },
      ],
      testHistory: [],
      createdAt: '18/10/2026',
    },
    {
      id: 'HS12A1-05',
      studentCode: 'HS12A1-05',
      name: 'Võ Thảo Linh',
      classId: sampleClassId,
      className: sampleClass.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      password: '123',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Linh',
      school: teacher.school || 'THPT Chuyên',
      status: 'needs_remedy',
      latestScore: 4.0,
      gapsCount: 3,
      detectedGaps: [
        'Chưa đặt điều kiện xác định biểu thức chứa căn',
        'Biến đổi sai công thức logarit của một thương',
        'Nhầm điều kiện cơ số $a > 0, a \\neq 1$',
      ],
      notesFromTeacher: 'Cần ôn lại bảng tính chất và đồ thị hàm số Mũ - Logarit.',
      assignedTasks: [
        {
          id: 'task-4',
          title: 'Bài tập khắc phục lỗ hổng biến đổi Logarit cơ bản',
          topic: 'Hàm số Mũ và Logarit',
          deadline: '23/10/2026',
          completed: false,
          assignedAt: '18/10/2026',
        },
      ],
      testHistory: [
        {
          id: 'test-105',
          date: '17/10/2026 10:45',
          score: 4.0,
          durationMinutes: 28,
          correctAnswers: 2,
          totalQuestions: 6,
          gapsDetected: ['Chưa đặt điều kiện xác định', 'Nhầm lẫn định lý/công thức'],
        },
      ],
      createdAt: '18/10/2026',
    },
  ];

  const sampleSubmissions: MathSubmission[] = INITIAL_SUBMISSIONS.map((sub, idx) => ({
    ...sub,
    classId: sampleClassId,
    studentId: sampleStudents[idx % sampleStudents.length].id,
    studentName: sampleStudents[idx % sampleStudents.length].name,
  }));

  return {
    classes: [sampleClass],
    students: sampleStudents,
    submissions: sampleSubmissions,
  };
}

// ----------------------------------------------------
// QUẢN LÝ PHIÊN ĐĂNG NHẬP (AUTH SESSION)
// ----------------------------------------------------
export function getSavedAuthSession(): AuthSession {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.teacherUser || parsed.studentUser)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Lỗi đọc auth session từ localStorage:', e);
  }
  return {
    role: 'teacher',
    teacherUser: null,
    studentUser: null,
    isAuthenticated: false,
  };
}

export function saveAuthSession(session: AuthSession): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
  } catch (e) {
    console.error('Lỗi lưu auth session vào localStorage:', e);
  }
}

export function clearAuthSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  } catch (e) {
    console.error('Lỗi xóa auth session:', e);
  }
}

// ----------------------------------------------------
// DỊCH VỤ GIÁO VIÊN & ĐĂNG NHẬP GOOGLE MULTI-TEACHER
// ----------------------------------------------------
export function getSavedTeachers(): Record<string, Teacher> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Lỗi đọc danh sách giáo viên:', e);
  }
  return {};
}

export function saveTeacherProfile(teacher: Teacher): void {
  try {
    const all = getSavedTeachers();
    all[teacher.id] = teacher;
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(all));
  } catch (e) {
    console.error('Lỗi lưu giáo viên:', e);
  }
}

// Đăng nhập giáo viên bằng Google (hoặc Smart Fallback)
export function loginTeacherWithGoogle(
  email: string,
  name?: string,
  school?: string,
  avatar?: string
): { teacher: Teacher; isNewTeacher: boolean } {
  const teacherId = `teacher_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const allTeachers = getSavedTeachers();
  let teacher = allTeachers[teacherId];
  let isNewTeacher = false;

  if (!teacher) {
    isNewTeacher = true;
    teacher = {
      id: teacherId,
      email: email.trim().toLowerCase(),
      name: name?.trim() || `ThS. ${email.split('@')[0]}`,
      school: school?.trim() || 'Trường THPT Chuẩn GDPT 2018',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      classList: [],
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };
    saveTeacherProfile(teacher);

    // Tự động khởi tạo dữ liệu mẫu cho giáo viên mới
    const sample = createSampleDataForTeacher(teacher);
    teacher.classList = sample.classes;
    saveTeacherProfile(teacher);
    saveClassesForTeacher(teacher.id, sample.classes);
    saveStudentsForTeacher(teacher.id, sample.students);
    saveSubmissionsForTeacher(teacher.id, sample.submissions);
  } else {
    // Cập nhật tên/trường nếu có
    if (name && name !== teacher.name) teacher.name = name;
    if (school && school !== teacher.school) teacher.school = school;
    saveTeacherProfile(teacher);
  }

  // Cập nhật Auth Session
  const session: AuthSession = {
    role: 'teacher',
    teacherUser: teacher,
    studentUser: null,
    isAuthenticated: true,
  };
  saveAuthSession(session);

  return { teacher, isNewTeacher };
}

// ----------------------------------------------------
// QUẢN LÝ LỚP HỌC THEO GIÁO VIÊN (ISOLATION)
// ----------------------------------------------------
export function getClassesForTeacher(teacherId: string): ClassRoom[] {
  try {
    const key = `${STORAGE_KEYS.CLASSES_PREFIX}${teacherId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Lỗi đọc lớp học của giáo viên ${teacherId}:`, e);
  }
  return [];
}

export function saveClassesForTeacher(teacherId: string, classes: ClassRoom[]): void {
  try {
    const key = `${STORAGE_KEYS.CLASSES_PREFIX}${teacherId}`;
    localStorage.setItem(key, JSON.stringify(classes));
  } catch (e) {
    console.error(`Lỗi lưu lớp học của giáo viên ${teacherId}:`, e);
  }
}

// ----------------------------------------------------
// QUẢN LÝ HỌC SINH THEO GIÁO VIÊN & THEO LỚP
// ----------------------------------------------------
export function getStudentsForTeacher(teacherId: string): StudentAccount[] {
  try {
    const key = `math_students_teacher_${teacherId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Lỗi đọc học sinh của giáo viên ${teacherId}:`, e);
  }
  return [];
}

export function saveStudentsForTeacher(teacherId: string, students: StudentAccount[]): void {
  try {
    const key = `math_students_teacher_${teacherId}`;
    localStorage.setItem(key, JSON.stringify(students));
    
    // Đồng thời cập nhật vào global pool phục vụ đăng nhập học sinh
    syncGlobalStudentsPool();
  } catch (e) {
    console.error(`Lỗi lưu học sinh của giáo viên ${teacherId}:`, e);
  }
}

// Đồng bộ danh sách học sinh toàn hệ thống để học sinh đăng nhập dễ dàng
export function syncGlobalStudentsPool(): void {
  try {
    const allTeachers = getSavedTeachers();
    const globalList: StudentAccount[] = [];

    Object.keys(allTeachers).forEach((tid) => {
      const studs = getStudentsForTeacher(tid);
      globalList.push(...studs);
    });

    localStorage.setItem(STORAGE_KEYS.GLOBAL_STUDENTS, JSON.stringify(globalList));
  } catch (e) {
    console.warn('Lỗi đồng bộ danh sách học sinh toàn hệ thống:', e);
  }
}

export function getAllGlobalStudents(): StudentAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_STUDENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Lỗi đọc danh sách học sinh toàn hệ thống:', e);
  }
  return [];
}

// ----------------------------------------------------
// QUẢN LÝ BÀI NỘP / PHÂN TÍCH CHẨN ĐOÁN CỦA LỚP
// ----------------------------------------------------
export function getSubmissionsForTeacher(teacherId: string): MathSubmission[] {
  try {
    const key = `${STORAGE_KEYS.SUBMISSIONS_PREFIX}${teacherId}`;
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Lỗi đọc bài nộp của giáo viên ${teacherId}:`, e);
  }
  return [];
}

export function saveSubmissionsForTeacher(teacherId: string, subs: MathSubmission[]): void {
  try {
    const key = `${STORAGE_KEYS.SUBMISSIONS_PREFIX}${teacherId}`;
    localStorage.setItem(key, JSON.stringify(subs));
  } catch (e) {
    console.error(`Lỗi lưu bài nộp của giáo viên ${teacherId}:`, e);
  }
}

// ----------------------------------------------------
// DỊCH VỤ ĐĂNG NHẬP HỌC SINH (MÃ HOẶC HỌ TÊN + MẬT KHẨU)
// ----------------------------------------------------
export interface StudentLoginResult {
  success: boolean;
  student?: StudentAccount;
  errorMessage?: string;
}

export function loginStudentWithCredentials(
  identifier: string, // Mã số (e.g. HS12A1-01) HOẶC Họ và tên (Nguyễn Văn An)
  password: string,
  classId?: string
): StudentLoginResult {
  const normId = normalizeString(identifier);
  const normPass = password.trim();

  if (!normId || !normPass) {
    return {
      success: false,
      errorMessage: 'Vui lòng nhập đầy đủ Mã số (hoặc Họ tên) và Mật khẩu do giáo viên cấp.',
    };
  }

  // Đảm bảo pool đồng bộ
  syncGlobalStudentsPool();
  const allStudents = getAllGlobalStudents();

  // Tìm kiếm theo ID hoặc Tên
  const matched = allStudents.find((st) => {
    const matchId = normalizeString(st.id) === normId || normalizeString(st.studentCode) === normId;
    const matchName = normalizeString(st.name) === normId;
    const matchClass = classId ? st.classId === classId : true;

    return (matchId || matchName) && matchClass;
  });

  if (!matched) {
    return {
      success: false,
      errorMessage:
        'Không tìm thấy học sinh với thông tin đã nhập. Vui lòng kiểm tra lại Họ tên/Mã số hoặc liên hệ Giáo viên bộ môn để nhận tài khoản.',
    };
  }

  // Kiểm tra mật khẩu (hỗ trợ pass mặc định '123' hoặc khớp chuẩn)
  if (matched.password.trim() !== normPass) {
    return {
      success: false,
      errorMessage:
        'Mật khẩu không chính xác. Mật khẩu khởi tạo thường là do thầy cô cung cấp (ví dụ: 123 hoặc mã riêng). Hãy liên hệ giáo viên để cấp lại nếu quên.',
    };
  }

  // Lưu phiên đăng nhập
  const session: AuthSession = {
    role: 'student',
    teacherUser: null,
    studentUser: matched,
    isAuthenticated: true,
  };
  saveAuthSession(session);

  return {
    success: true,
    student: matched,
  };
}

// ----------------------------------------------------
// TÍNH NĂNG NHẬP HÀNG LOẠT (BULK IMPORT) CHO GIÁO VIÊN
// ----------------------------------------------------
export function parseBulkStudents(
  text: string,
  classId: string,
  className: string,
  teacherId: string,
  teacherName: string,
  defaultGrade: string = '12'
): StudentAccount[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const result: StudentAccount[] = [];

  // Lấy danh sách hiện có để tính số thứ tự tiếp theo
  const currentStudents = getStudentsForTeacher(teacherId).filter((s) => s.classId === classId);
  let nextIdx = currentStudents.length + 1;

  for (const line of lines) {
    const parts = line.split(/[|\t,;]+/).map((p) => p.trim());
    let code = '';
    let name = '';
    let pass = '';

    if (parts.length >= 3) {
      code = parts[0];
      name = parts[1];
      pass = parts[2];
    } else if (parts.length === 2) {
      name = parts[0];
      pass = parts[1];
      code = `HS${defaultGrade}-${String(nextIdx).padStart(2, '0')}`;
    } else if (parts.length === 1) {
      name = parts[0];
      code = `HS${defaultGrade}-${String(nextIdx).padStart(2, '0')}`;
      pass = generateRandomPassword(6);
    }

    if (name) {
      result.push({
        id: code,
        studentCode: code,
        name,
        classId,
        className,
        teacherId,
        teacherName,
        password: pass || generateRandomPassword(6),
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
        status: 'not_started',
        gapsCount: 0,
        detectedGaps: [],
        assignedTasks: [],
        testHistory: [],
        createdAt: new Date().toLocaleDateString('vi-VN'),
      });
      nextIdx++;
    }
  }

  return result;
}

// ----------------------------------------------------
// XUẤT / NHẬP JSON TOÀN BỘ DỮ LIỆU CỦA GIÁO VIÊN
// ----------------------------------------------------
export function exportTeacherWorkspaceJson(teacherId: string): string {
  const teachers = getSavedTeachers();
  const teacher = teachers[teacherId];
  const classes = getClassesForTeacher(teacherId);
  const students = getStudentsForTeacher(teacherId);
  const submissions = getSubmissionsForTeacher(teacherId);

  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    teacher,
    classes,
    students,
    submissions,
  };

  return JSON.stringify(payload, null, 2);
}

export function importTeacherWorkspaceJson(teacherId: string, jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.classes || !data.students) {
      throw new Error('Dữ liệu JSON không đúng định dạng của MathDiagnostic AI');
    }

    saveClassesForTeacher(teacherId, data.classes);
    saveStudentsForTeacher(teacherId, data.students);
    if (data.submissions) {
      saveSubmissionsForTeacher(teacherId, data.submissions);
    }
    return true;
  } catch (e) {
    console.error('Lỗi khi import JSON:', e);
    return false;
  }
}
