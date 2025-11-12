import React from 'react';
import type { Teacher, Halaqa } from '../types';
import { CircularProgress } from './CircularProgress';
import { PencilIcon } from './icons/PencilIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { MailIcon } from './icons/MailIcon';

interface TeacherProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    teacher: Teacher;
    assignedHalaqat: Halaqa[];
    studentCount: number;
    averageMemorization: number;
}

const StatItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-center">
        <span className="text-green-700 dark:text-green-500 mb-2">{icon}</span>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({ isOpen, onClose, onEdit, teacher, assignedHalaqat, studentCount, averageMemorization }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{teacher.name}</h2>
                         <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MailIcon className="w-4 h-4" />
                            <span>{teacher.email}</span>
                        </div>
                    </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                </div>
                
                {/* Body */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Performance & Stats */}
                        <div className="flex flex-col items-center justify-center gap-6 p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
                             <div className="text-center">
                                <CircularProgress progress={averageMemorization} color="#16A34A" size={100} strokeWidth={8} />
                                <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">متوسط حفظ الطلاب</p>
                            </div>
                             <div className="grid grid-cols-2 gap-4 w-full">
                                <StatItem icon={<BookOpenIcon className="w-6 h-6"/>} label="عدد الحلقات" value={assignedHalaqat.length} />
                                <StatItem icon={<UsersIcon className="w-6 h-6"/>} label="إجمالي الطلاب" value={studentCount} />
                            </div>
                        </div>

                        {/* Assigned Halaqat */}
                        <div className="p-4">
                           <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2 mb-3">الحلقات المسندة</h3>
                           {assignedHalaqat.length > 0 ? (
                                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto pr-2">
                                    {assignedHalaqat.map(halaqa => (
                                        <li key={halaqa.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                                            <span className="font-medium text-gray-800 dark:text-gray-200">{halaqa.name}</span>
                                            <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">{halaqa.studentCount} طلاب</span>
                                        </li>
                                    ))}
                                </ul>
                           ) : (
                                <p className="text-center text-gray-500 dark:text-gray-400 mt-8">لم يتم إسناد أي حلقات لهذا المعلم بعد.</p>
                           )}
                        </div>
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