import React, { useState, useEffect } from 'react';
import { Role, MathSubmission, Student, Teacher } from './types/index.ts';
import { INITIAL_SUBMISSIONS, DEFAULT_STUDENT, DEFAULT_TEACHER } from './data/mockData.ts';
import Navbar from './components/Navbar.tsx';
import StudentWorkspace from './components/StudentWorkspace.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';

export default function App() {
  const [currentRole, setCurrentRole] = useState<Role>('student');
  
  // Student Profile: blank by default, auto-fills when login data exists or when student enters name
  const [student, setStudent] = useState<Student>(() => {
    try {
      const saved = localStorage.getItem('math_student_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read student profile cache', e);
    }
    return DEFAULT_STUDENT;
  });

  // Teacher Profile: blank by default, auto-fills when login data exists or when teacher enters info
  const [teacher, setTeacher] = useState<Teacher>(() => {
    try {
      const saved = localStorage.getItem('math_teacher_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to read teacher profile cache', e);
    }
    return DEFAULT_TEACHER;
  });

  const [submissions, setSubmissions] = useState<MathSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('math_submissions_cache');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read submissions cache', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Save student profile
  const handleUpdateStudent = (newStudent: Student) => {
    setStudent(newStudent);
    try {
      localStorage.setItem('math_student_profile', JSON.stringify(newStudent));
    } catch (e) {
      console.warn('Failed to save student profile', e);
    }
  };

  // Save teacher profile
  const handleUpdateTeacher = (newTeacher: Teacher) => {
    setTeacher(newTeacher);
    try {
      localStorage.setItem('math_teacher_profile', JSON.stringify(newTeacher));
    } catch (e) {
      console.warn('Failed to save teacher profile', e);
    }
  };

  // Save submissions cache
  useEffect(() => {
    try {
      localStorage.setItem('math_submissions_cache', JSON.stringify(submissions));
    } catch (e) {
      console.warn('Failed to cache submissions', e);
    }
  }, [submissions]);

  // Handler for student adding a new submission
  const handleNewSubmission = (newSub: MathSubmission) => {
    setSubmissions((prev) => [newSub, ...prev]);
  };

  // Handler for student updating Socratic self-reflection notes
  const handleUpdateNotes = (submissionId: string, notes: string[]) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, studentNotes: notes } : s))
    );
  };

  // Handler for marking a submission as resolved after self-reflection
  const handleMarkResolved = (submissionId: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, hasResolvedMistake: true } : s))
    );
  };

  // Save API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {currentRole === 'student' ? (
          <StudentWorkspace
            apiKey={apiKey}
            student={student}
            onUpdateStudent={handleUpdateStudent}
            onNewSubmission={handleNewSubmission}
            submissions={submissions.filter((s) => s.studentId === student.id || !s.studentId)}
            onUpdateNotes={handleUpdateNotes}
            onMarkResolved={handleMarkResolved}
          />
        ) : (
          <TeacherDashboard
            teacher={teacher}
            onUpdateTeacher={handleUpdateTeacher}
            submissions={submissions}
            onUpdateNotes={handleUpdateNotes}
            onMarkResolved={handleMarkResolved}
          />
        )}
      </main>

      {/* Sư phạm Footer */}
      <footer className="no-print mt-12 py-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">MathDiagnostic AI</span>
            <span>—</span>
            <span>Hệ thống Đánh giá Thích ứng và Chẩn đoán Vùng trũng Kiến thức Toán THPT</span>
          </div>

          <div className="text-slate-400">
            Khung Đánh giá Năng lực Giáo dục Phổ thông 2018 • Bộ GD&ĐT
          </div>
        </div>
      </footer>
    </div>
  );
}
