export interface Profile { user_id: string; name: string; school: string; role: 'teacher'|'student'; forced_password_change: boolean }
export interface Session { profile: Profile; student: { user_id: string; student_code: string; class_id: string; data: {name: string} } | null }
export interface ClassRecord { id: string; teacher_id: string; data: {name: string; grade: string; academicYear: string; classCode: string} }
export interface StudentRecord { user_id: string; student_code: string; class_id: string; data: {name: string; status?: string} }
export interface Assignment {id: string; title: string; lesson_id: string; class_id: string; deadline: string | null}
export interface Workspace { classes: ClassRecord[]; students: StudentRecord[]; submissions: {id: string; student_id: string; created_at: string; data: {problemText: string; evaluation: {verdict: string; chatReply: string; reviewState: string}}}[]; assignments: Assignment[] }
