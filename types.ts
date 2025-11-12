
export enum UserRole {
  Admin = 'admin',
  Teacher = 'teacher',
  Student = 'student',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  fatherPhoneNumber?: string;
  halaqaId: string;
  teacherId: string;
  memorizationProgress: number; // Percentage
  attendanceRate: number; // Percentage
  // FIX: Added parentId to associate students with parents.
  parentId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string;
}

// FIX: Added Parent interface to define the shape of a parent object.
export interface Parent {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Halaqa {
  id: string;
  name: string;
  teacherId: string;
  studentCount: number;
}

export type Page = 'dashboard' | 'students' | 'teachers' | 'halaqat' | 'attendance' | 'memorization' | 'reports' | 'settings' | 'parents';

export interface MemorizationLog {
  id: string;
  studentId: string;
  teacherId: string;
  halaqaId: string;
  date: {
    seconds: number;
    nanoseconds: number;
  }; // Firestore Timestamp
  surah: string;
  fromVerse: number;
  toVerse: number;
  quality: 'good' | 'average' | 'repeat';
  notes: string;
}

export interface AttendanceLog {
  id: string;
  date: {
    seconds: number;
    nanoseconds: number;
  }; // Firestore Timestamp
  halaqaId: string;
  teacherId: string;
  records: Record<string, 'present' | 'absent' | 'late'>; // studentId: status
}

export type ActivityLogType = 'new_student' | 'memorization_log' | 'absence_log';

export interface ActivityLog {
  id: string;
  type: ActivityLogType;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  }; // Firestore Timestamp
  details: {
    studentName?: string;
    halaqaName?: string;
    teacherName?: string;
    surah?: string;
  };
}
