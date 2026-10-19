import React, { useState } from 'react';
import { 
  X, 
  User, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Send, 
  Key, 
  FileText, 
  BookOpen, 
  Layers, 
  Target, 
  Calendar,
  Sparkles,
  Trash2,
  Check
} from 'lucide-react';
import { StudentAccount, AssignedTask } from '../types/index.ts';
import MathRenderer from './MathRenderer.tsx';
import { generateRandomPassword } from '../services/storageService.ts';

interface StudentProfileModalProps {
  student: StudentAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent: (updated: StudentAccount) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent,
}) => {
  if (!isOpen || !student) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'tests' | 'gaps' | 'tasks' | 'settings'>('overview');
  
  // Teacher Comment state
  const [teacherComment, setTeacherComment] = useState(student.notesFromTeacher || '');
  const [commentSaved, setCommentSaved] = useState(false);

  // New task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTopic, setTaskTopic] = useState('Khắc phục điều kiện xác định căn thức');
  const [taskDeadline, setTaskDeadline] = useState('');

  // Password reset state
  const [currentPassword, setCurrentPassword] = useState(student.password);
  const [isPasswordSaved, setIsPasswordSaved] = useState(false);

  // Lưu lời nhận xét
  const handleSaveComment = () => {
    const updated = { ...student, notesFromTeacher: teacherComment.trim() };
    onUpdateStudent(updated);
    setCommentSaved(true);
    setTimeout(() => setCommentSaved(false), 1500);
  };

  // Thêm nhiệm vụ ôn tập mới cho học sinh
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: AssignedTask = {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      topic: taskTopic,
      deadline: taskDeadline || new Date(Date.now() + 7 * 86400000).toLocaleDateString('vi-VN'),
      completed: false,
      assignedAt: new Date().toLocaleDateString('vi-VN'),
    };

    const updatedTasks = [...(student.assignedTasks || []), newTask];
    const updated = { ...student, assignedTasks: updatedTasks };
    onUpdateStudent(updated);
    setTaskTitle('');
  };

  // Đổi trạng thái hoàn thành nhiệm vụ
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = (student.assignedTasks || []).map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateStudent({ ...student, assignedTasks: updatedTasks });
  };

  // Xóa nhiệm vụ
  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = (student.assignedTasks || []).filter((t) => t.id !== taskId);
    onUpdateStudent({ ...student, assignedTasks: updatedTasks });
  };

  // Cấp lại mật khẩu mới
  const handleResetPassword = () => {
    const newPass = generateRandomPassword(6);
    setCurrentPassword(newPass);
    onUpdateStudent({ ...student, password: newPass });
    setIsPasswordSaved(true);
    setTimeout(() => setIsPasswordSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Hồ sơ Học sinh */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 ring-2 ring-emerald-400/30 flex items-center justify-center overflow-hidden shrink-0">
              {student.avatar ? (
                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{student.name}</h2>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {student.id}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Lớp: <span className="font-semibold text-white">{student.className || 'Toán THPT'}</span> • Giáo viên: <span className="text-emerald-300">{student.teacherName || 'Bộ môn Toán'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng quan & Kết quả', icon: Award },
            { id: 'gaps', label: 'Bản đồ Vùng trũng GDPT 2018', icon: AlertTriangle },
            { id: 'tests', label: 'Lịch sử bài làm thích ứng', icon: Clock },
            { id: 'tasks', label: 'Giao bài tập & Lời dặn', icon: Target },
            { id: 'settings', label: 'Cấp lại Mật khẩu', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: TỔNG QUAN */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-800 block">Điểm Chẩn đoán mới nhất</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">
                      {student.latestScore !== undefined ? `${student.latestScore}` : 'Chưa thi'}
                    </span>
                    {student.latestScore !== undefined && <span className="text-xs text-emerald-600 font-bold">/ 10</span>}
                  </div>
                  <span className="text-[11px] text-emerald-600 mt-1 block">
                    {student.latestScore && student.latestScore >= 8
                      ? 'Nắm chắc kiến thức cốt lõi'
                      : student.latestScore && student.latestScore >= 5
                      ? 'Đạt mức Thông hiểu cơ bản'
                      : 'Cần bù đắp kiến thức gấp'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                  <span className="text-xs font-semibold text-amber-800 block">Vùng trũng Kiến thức phát hiện</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-amber-700">
                      {student.detectedGaps?.length || student.gapsCount || 0}
                    </span>
                    <span className="text-xs text-amber-600 font-bold">chuyên đề</span>
                  </div>
                  <span className="text-[11px] text-amber-700 mt-1 block">
                    {student.gapsCount > 0 ? 'Cần giáo viên can thiệp bù đắp' : 'Chưa phát hiện lỗ hổng nghiêm trọng'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                  <span className="text-xs font-semibold text-blue-800 block">Nhiệm vụ ôn tập đã hoàn thành</span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-700">
                      {(student.assignedTasks || []).filter((t) => t.completed).length} / {(student.assignedTasks || []).length}
                    </span>
                    <span className="text-xs text-blue-600 font-bold">bài</span>
                  </div>
                  <span className="text-[11px] text-blue-700 mt-1 block">Tiến độ khắc phục lỗ hổng</span>
                </div>
              </div>

              {/* Lời nhận xét của Giáo viên */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Lời dặn & Nhận xét sư phạm gửi học sinh:
                  </h4>
                  {commentSaved && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Đã cập nhật cho học sinh
                    </span>
                  )}
                </div>
                <textarea
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="Nhập lời dặn dò, hướng dẫn giải hoặc định hướng bù đắp kiến thức cho học sinh..."
                  rows={3}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveComment}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Lưu & Gửi đến tài khoản học sinh
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BẢN ĐỒ VÙNG TRŨNG */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                <strong>Phân tích theo chuẩn GDPT 2018:</strong> Hệ thống đối chiếu các sai sót qua các mức độ nhận thức (Nhận biết – Thông hiểu – Vận dụng) để chỉ ra chính xác mắt xích tư duy bị đứt gãy.
              </div>

              {student.detectedGaps && student.detectedGaps.length > 0 ? (
                <div className="space-y-3">
                  {student.detectedGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 transition-all shadow-xs flex items-start gap-3"
                    >
                      <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{gap}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            Vùng trũng
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          Học sinh có thói quen biến đổi công thức máy móc trước khi xác định phạm vi xác định của biến. Cần rèn luyện phản xạ xét điều kiện chặt chẽ.
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Chưa ghi nhận vùng trũng kiến thức nghiêm trọng</p>
                  <p className="text-xs text-slate-500 mt-1">Học sinh hoàn thành tốt các bài đánh giá thích ứng.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ BÀI THI */}
          {activeTab === 'tests' && (
            <div className="space-y-4">
              {student.testHistory && student.testHistory.length > 0 ? (
                student.testHistory.map((test) => (
                  <div key={test.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">{test.date}</span>
                        <span className="text-[11px] text-slate-500 font-mono">({test.durationMinutes} phút)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          Đúng {test.correctAnswers}/{test.totalQuestions} câu
                        </span>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-800">
                          {test.score} / 10
                        </span>
                      </div>
                    </div>

                    {test.details && (
                      <div className="space-y-2 pt-1">
                        {test.details.map((d, dIdx) => (
                          <div
                            key={dIdx}
                            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                              d.isCorrect ? 'bg-emerald-50/60 border border-emerald-100' : 'bg-rose-50/60 border border-rose-100'
                            }`}
                          >
                            <span className="font-bold text-slate-500 shrink-0">Câu {d.questionId}:</span>
                            <div className="flex-1 space-y-1">
                              <MathRenderer content={d.problem} />
                              <div className="text-[11px] text-slate-600">
                                <strong>Trả lời:</strong> <MathRenderer content={d.studentAnswer} inline />
                              </div>
                              {d.note && (
                                <p className="text-[11px] text-rose-700 italic">
                                  <strong>Nhận xét:</strong> {d.note}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                d.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                              }`}
                            >
                              {d.isCorrect ? 'Chính xác' : 'Sai sót'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  Chưa có lịch sử làm bài. Nhắc học sinh đăng nhập vào làm bài chẩn đoán.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GIAO NHIỆM VỤ ÔN TẬP */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Form Giao bài tập */}
              <form onSubmit={handleAddTask} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  Giao thêm bài tập / nhiệm vụ khắc phục vùng trũng:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="Tiêu đề nhiệm vụ (VD: Hoàn thành 5 bài toán phương trình vô tỉ có nghiệm ngoại lai)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={taskTopic}
                      onChange={(e) => setTaskTopic(e.target.value)}
                      placeholder="Chủ đề kiến thức"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={taskDeadline}
                      onChange={(e) => setTaskDeadline(e.target.value)}
                      placeholder="Hạn nộp (VD: 25/10/2026)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!taskTitle.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Giao nhiệm vụ
                  </button>
                </div>
              </form>

              {/* Danh sách nhiệm vụ đã giao */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Nhiệm vụ đã giao cho học sinh:</span>
                {(student.assignedTasks || []).length > 0 ? (
                  student.assignedTasks!.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              task.completed ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Chủ đề: <span className="font-semibold text-slate-700">{task.topic}</span> • Hạn nộp:{' '}
                            <span className="text-amber-700 font-medium">{task.deadline || 'Không'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Chưa giao bài tập nào cho học sinh này.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CẤP LẠI MẬT KHẨU */}
          {activeTab === 'settings' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-lg">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" />
                Quản lý Mật khẩu đăng nhập của Học sinh
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mật khẩu hiện tại của học sinh đang được lưu là:
              </p>

              <div className="flex items-center gap-3">
                <span className="px-4 py-2 rounded-xl bg-white border-2 border-slate-300 text-sm font-mono font-black text-emerald-700 tracking-wider">
                  {currentPassword}
                </span>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer transition-all shadow-xs"
                >
                  Sinh mật khẩu ngẫu nhiên mới
                </button>
              </div>

              {isPasswordSaved && (
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-4 h-4" /> Đã lưu mật khẩu mới thành công! Thầy/Cô hãy gửi mật khẩu này cho học sinh.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            ID: {student.id} • Lớp: {student.className}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs cursor-pointer transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;
