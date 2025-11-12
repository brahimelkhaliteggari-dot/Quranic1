import React, { useMemo } from 'react';
import type { Student, Halaqa, Teacher, AttendanceLog } from '../types';
import { CircularProgress } from './CircularProgress';
import { PhoneIcon } from './icons/PhoneIcon';
import { IdentificationIcon } from './icons/IdentificationIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { PencilIcon } from './icons/PencilIcon';

interface StudentProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    student: Student;
    halaqa?: Halaqa;
    teacher?: Teacher;
    attendanceLogs: AttendanceLog[];
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | number }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 text-sm">
        <span className="text-green-700 dark:text-green-400">{icon}</span>
        <span className="font-semibold text-gray-600 dark:text-gray-400">{label}:</span>
        <span className="text-gray-800 dark:text-gray-200">{value || 'غير متوفر'}</span>
    </div>
);

const StatusBadge: React.FC<{ status: 'present' | 'absent' | 'late' }> = ({ status }) => {
    const styles = {
        present: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        absent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        late: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
    };
    const text = {
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {text[status]}
        </span>
    );
};

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose, onEdit, student, halaqa, teacher, attendanceLogs }) => {
    if (!isOpen) return null;

    const studentAttendanceHistory = useMemo(() => {
        if (!attendanceLogs) return [];
        
        return attendanceLogs
            .filter(log => log.records && student.id in log.records)
            .map(log => ({
                date: new Date(log.date.seconds * 1000),
                status: log.records[student.id],
            }))
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 5); // Show last 5 records
    }, [attendanceLogs, student.id]);
    
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{student.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">الملف الشخصي للطالب</p>
                    </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                </div>
                
                {/* Body */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Performance Metrics */}
                        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="text-center">
                                <CircularProgress progress={student.memorizationProgress} color="#16A34A" size={100} strokeWidth={8} />
                                <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">تقدم الحفظ</p>
                            </div>
                            <div className="text-center">
                                <CircularProgress progress={student.attendanceRate} color="#F59E0B" size={100} strokeWidth={8} />
                                <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">معدل الحضور</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 p-4">
                            <InfoRow icon={<UserCircleIcon className="w-5 h-5"/>} label="العمر" value={`${student.age} سنة`} />
                            <InfoRow icon={<BookOpenIcon className="w-5 h-5"/>} label="الحلقة" value={halaqa?.name} />
                            <InfoRow icon={<IdentificationIcon className="w-5 h-5"/>} label="المعلم" value={teacher?.name} />
                            <InfoRow icon={<PhoneIcon className="w-5 h-5"/>} label="هاتف التواصل" value={student.fatherPhoneNumber} />
                        </div>
                    </div>
                    
                    {/* Attendance History */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            سجل الحضور الأخير
                        </h3>
                        {studentAttendanceHistory.length > 0 ? (
                            <ul className="space-y-2">
                                {studentAttendanceHistory.map((record, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {formatDate(record.date)}
                                        </span>
                                        <StatusBadge status={record.status} />
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                                لا يوجد سجل حضور مسجل.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-4 space-x-reverse p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg border-t dark:border-gray-700">
                     <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        إغلاق
                    </button>
                    <button 
                        onClick={onEdit} 
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <PencilIcon className="w-4 h-4" />
                        تعديل
                    </button>
                </div>
            </div>
        </div>
    );
};


const UserCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const UsersIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 016 2.803M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />
  </svg>
);