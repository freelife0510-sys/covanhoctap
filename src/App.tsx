import React, { useState, useEffect } from 'react';
import { 
  Role, 
  MathSubmission, 
  StudentAccount, 
  Teacher, 
  ClassRoom,
  AuthSession 
} from './types/index.ts';
import { 
  getSavedAuthSession, 
  saveAuthSession, 
  clearAuthSession,
  getClassesForTeacher,
  saveClassesForTeacher,
  getStudentsForTeacher,
  saveStudentsForTeacher,
  getSubmissionsForTeacher,
  saveSubmissionsForTeacher,
  saveTeacherProfile,
  createSampleDataForTeacher,
  exportTeacherWorkspaceJson,
  importTeacherWorkspaceJson,
  loginTeacherWithGoogle
} from './services/storageService.ts';
import Navbar from './components/Navbar.tsx';
import StudentWorkspace from './components/StudentWorkspace.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';
import TeacherGoogleLoginModal from './components/TeacherGoogleLoginModal.tsx';
import StudentLoginModal from './components/StudentLoginModal.tsx';

// Thanh lọc triệt để cache trình duyệt cũ nếu còn sót dữ liệu "giaovien.toan"
try {
  ['math_auth_session', 'math_teacher_profile', 'math_teachers_db', 'google_teacher_email'].forEach((key) => {
    const val = localStorage.getItem(key);
    if (val && (val.includes('giaovien.toan') || val.includes('To\u00e0n') || val.includes('Toan'))) {
      localStorage.removeItem(key);
    }
  });
} catch (e) {
  console.warn('Lỗi kiểm tra cache cũ:', e);
}

export default function App() {
  // Auth Session State
  const [authSession, setAuthSession] = useState<AuthSession>(() => {
    const saved = getSavedAuthSession();
    if (saved && saved.isAuthenticated) return saved;

    const savedGoogleEmail = localStorage.getItem('google_teacher_email');
    if (savedGoogleEmail) {
      const { teacher } = loginTeacherWithGoogle(savedGoogleEmail);
      return {
        role: 'teacher',
        teacherUser: teacher,
        studentUser: null,
        isAuthenticated: true,
      };
    }

    const { teacher } = loginTeacherWithGoogle('giaovien@gmail.com', 'Giáo viên Bộ môn Toán', 'THPT Chuẩn GDPT 2018');
    return {
      role: 'teacher',
      teacherUser: teacher,
      studentUser: null,
      isAuthenticated: true,
    };
  });

  const [currentRole, setCurrentRole] = useState<Role>(authSession.role || 'teacher');
  const [showTeacherLoginModal, setShowTeacherLoginModal] = useState(false);
  const [showStudentLoginModal, setShowStudentLoginModal] = useState(false);

  // Active Teacher Profile & Workspace Data
  const [teacher, setTeacher] = useState<Teacher>(() => {
    return (
      authSession.teacherUser || {
        id: 'teacher_default',
        email: 'giaovien@gmail.com',
        name: 'Giáo viên Bộ môn Toán',
        school: 'THPT Chuẩn GDPT 2018',
        classList: [],
      }
    );
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const loaded = getClassesForTeacher(teacher.id);
    if (loaded && loaded.length > 0) return loaded;
    const sample = createSampleDataForTeacher(teacher);
    saveClassesForTeacher(teacher.id, sample.classes);
    return sample.classes;
  });

  const [students, setStudents] = useState<StudentAccount[]>(() => {
    const loaded = getStudentsForTeacher(teacher.id);
    if (loaded && loaded.length > 0) return loaded;
    const sample = createSampleDataForTeacher(teacher);
    saveStudentsForTeacher(teacher.id, sample.students);
    return sample.students;
  });

  const [submissions, setSubmissions] = useState<MathSubmission[]>(() => {
    const loaded = getSubmissionsForTeacher(teacher.id);
    if (loaded && loaded.length > 0) return loaded;
    const sample = createSampleDataForTeacher(teacher);
    saveSubmissionsForTeacher(teacher.id, sample.submissions);
    return sample.submissions;
  });

  // Active Student Profile (for Student Mode)
  const [currentStudent, setCurrentStudent] = useState<StudentAccount>(() => {
    if (authSession.studentUser) return authSession.studentUser;
    if (students.length > 0) return students[0];
    const sample = createSampleDataForTeacher(teacher);
    return sample.students[0];
  });

  // API Key State
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Chuyển đổi Role: Bấm Giáo viên mở Đăng nhập Google, Bấm Học sinh mở Đăng nhập Học sinh
  const handleRoleChange = (newRole: Role) => {
    setCurrentRole(newRole);
    if (newRole === 'teacher') {
      setShowTeacherLoginModal(true);
      setShowStudentLoginModal(false);
    } else {
      setShowStudentLoginModal(true);
      setShowTeacherLoginModal(false);
    }
  };

  // Đồng bộ role khi authSession thay đổi
  useEffect(() => {
    setCurrentRole(authSession.role);
  }, [authSession.role]);

  // Cập nhật Giáo viên
  const handleUpdateTeacher = (newTeacher: Teacher) => {
    setTeacher(newTeacher);
    saveTeacherProfile(newTeacher);
    setAuthSession((prev) => ({ ...prev, teacherUser: newTeacher }));
    saveAuthSession({ ...authSession, teacherUser: newTeacher });
  };

  // Cập nhật Lớp học
  const handleUpdateClasses = (newClasses: ClassRoom[]) => {
    setClasses(newClasses);
    saveClassesForTeacher(teacher.id, newClasses);
    const updatedTeacher = { ...teacher, classList: newClasses };
    setTeacher(updatedTeacher);
    saveTeacherProfile(updatedTeacher);
  };

  // Cập nhật Danh sách Học sinh của Giáo viên
  const handleUpdateStudents = (newStudents: StudentAccount[]) => {
    setStudents(newStudents);
    saveStudentsForTeacher(teacher.id, newStudents);

    // Nếu học sinh đang đăng nhập nằm trong danh sách, cập nhật luôn
    if (currentStudent) {
      const match = newStudents.find((s) => s.id === currentStudent.id);
      if (match) {
        setCurrentStudent(match);
        if (authSession.role === 'student') {
          setAuthSession((prev) => ({ ...prev, studentUser: match }));
          saveAuthSession({ ...authSession, studentUser: match });
        }
      }
    }
  };

  // Cập nhật 1 học sinh cụ thể (từ Student Workspace hoặc Student Profile)
  const handleUpdateSingleStudent = (updatedStudent: StudentAccount) => {
    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    handleUpdateStudents(updatedList);
    setCurrentStudent(updatedStudent);
  };

  // Cập nhật Bài nộp
  const handleNewSubmission = (newSub: MathSubmission) => {
    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    saveSubmissionsForTeacher(teacher.id, updated);
  };

  const handleUpdateNotes = (submissionId: string, notes: string[]) => {
    const updated = submissions.map((s) =>
      s.id === submissionId ? { ...s, studentNotes: notes } : s
    );
    setSubmissions(updated);
    saveSubmissionsForTeacher(teacher.id, updated);
  };

  const handleMarkResolved = (submissionId: string) => {
    const updated = submissions.map((s) =>
      s.id === submissionId ? { ...s, hasResolvedMistake: true } : s
    );
    setSubmissions(updated);
    saveSubmissionsForTeacher(teacher.id, updated);
  };

  // Đăng xuất hoặc Đổi tài khoản
  const handleLogout = () => {
    clearAuthSession();
    if (currentRole === 'teacher') {
      setShowTeacherLoginModal(true);
    } else {
      setShowStudentLoginModal(true);
    }
  };

  // Đăng nhập Giáo viên bằng Google thành công
  const handleTeacherLoginSuccess = (teacherUser: Teacher) => {
    setTeacher(teacherUser);
    const loadedClasses = getClassesForTeacher(teacherUser.id);
    const loadedStudents = getStudentsForTeacher(teacherUser.id);
    const loadedSubmissions = getSubmissionsForTeacher(teacherUser.id);

    setClasses(loadedClasses);
    setStudents(loadedStudents);
    setSubmissions(loadedSubmissions);
    if (loadedStudents.length > 0) {
      setCurrentStudent(loadedStudents[0]);
    }

    setAuthSession({
      role: 'teacher',
      teacherUser,
      studentUser: null,
      isAuthenticated: true,
    });
    setCurrentRole('teacher');
    setShowTeacherLoginModal(false);
  };

  // Đăng nhập Học sinh thành công
  const handleStudentLoginSuccess = (studentUser: StudentAccount) => {
    setCurrentStudent(studentUser);
    setAuthSession({
      role: 'student',
      teacherUser: null,
      studentUser,
      isAuthenticated: true,
    });
    setCurrentRole('student');
    setShowStudentLoginModal(false);
  };

  // Sao lưu JSON
  const handleExportJson = () => {
    const jsonStr = exportTeacherWorkspaceJson(teacher.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MathDiagnostic_SaoLuu_${teacher.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Nhập JSON
  const handleImportJson = (jsonStr: string) => {
    const success = importTeacherWorkspaceJson(teacher.id, jsonStr);
    if (success) {
      setClasses(getClassesForTeacher(teacher.id));
      setStudents(getStudentsForTeacher(teacher.id));
      setSubmissions(getSubmissionsForTeacher(teacher.id));
      alert('Nhập dữ liệu thành công!');
    } else {
      alert('Tệp dữ liệu không hợp lệ!');
    }
  };

  // Lưu API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        authSession={authSession}
        onLogout={handleLogout}
        onOpenTeacherLogin={() => {
          setShowTeacherLoginModal(true);
          setShowStudentLoginModal(false);
        }}
        onOpenStudentLogin={() => {
          setShowStudentLoginModal(true);
          setShowTeacherLoginModal(false);
        }}
        teacherUser={teacher}
        studentUser={currentStudent}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {currentRole === 'student' ? (
          <StudentWorkspace
            apiKey={apiKey}
            student={currentStudent}
            onUpdateStudent={handleUpdateSingleStudent}
            onNewSubmission={handleNewSubmission}
            submissions={submissions.filter(
              (s) => s.studentId === currentStudent?.id || !s.studentId
            )}
            onUpdateNotes={handleUpdateNotes}
            onMarkResolved={handleMarkResolved}
          />
        ) : (
          <TeacherDashboard
            teacher={teacher}
            onUpdateTeacher={handleUpdateTeacher}
            classes={classes}
            onUpdateClasses={handleUpdateClasses}
            students={students}
            onUpdateStudents={handleUpdateStudents}
            submissions={submissions}
            onUpdateNotes={handleUpdateNotes}
            onMarkResolved={handleMarkResolved}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
          />
        )}
      </main>

      {/* Modal Đăng nhập Giáo viên bằng Google (hoàn toàn tách biệt) */}
      <TeacherGoogleLoginModal
        isOpen={showTeacherLoginModal}
        onClose={() => setShowTeacherLoginModal(false)}
        onLoginSuccess={handleTeacherLoginSuccess}
      />

      {/* Modal Đăng nhập Học sinh (hoàn toàn tách biệt) */}
      <StudentLoginModal
        isOpen={showStudentLoginModal}
        onClose={() => setShowStudentLoginModal(false)}
        onLoginSuccess={handleStudentLoginSuccess}
      />

      {/* Sư phạm Footer */}
      <footer className="no-print mt-12 py-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-semibold text-slate-700">MathDiagnostic AI</span>
              <span>—</span>
              <span>Hệ thống Đánh giá Thích ứng và Chẩn đoán Vùng trũng Kiến thức Toán THPT</span>
            </div>
            <div className="text-slate-600 font-medium pl-4">
              Thông tin liên hệ: Thầy Hồ Sỹ Long, SĐT 0943278804
            </div>
          </div>

          <div className="text-slate-400 text-left md:text-right pl-4 md:pl-0">
            Khung Đánh giá Năng lực Giáo dục Phổ thông 2018 • Bộ GD&ĐT
          </div>
        </div>
      </footer>
    </div>
  );
}
