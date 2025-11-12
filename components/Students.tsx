
import React, { useState, useMemo } from 'react';
import type { Student, Halaqa, Teacher, AttendanceLog } from '../types';
import { AddStudentModal } from './AddStudentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { StudentProfileModal } from './StudentProfileModal';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SearchIcon } from './icons/SearchIcon';

interface StudentsProps {
    students: Student[];
    halaqat: Halaqa[];
    teachers: Teacher[];
    onSave: (studentData: Omit<Student, 'id' | 'teacherId' | 'attendanceRate'>, id?: string) => void;
    onDelete: (id: string) => void;
    attendanceLogs: AttendanceLog[];
    teacherId?: string;
}

export const Students: React.FC<StudentsProps> = ({ students, halaqat, teachers, onSave, onDelete, attendanceLogs, teacherId }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHalaqa, setSelectedHalaqa] = useState('');
    const [minMemorization, setMinMemorization] = useState(0);

    const handleOpenAddModal = () => {
        setStudentToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (student: Student) => {
        setStudentToEdit(student);
        setIsAddEditModalOpen(true);
    };
    
    const handleOpenProfileModal = (student: Student) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    }

    const handleOpenDeleteModal = (student: Student) => {
        setStudentToDelete(student);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsAddEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsProfileModalOpen(false);
        setStudentToEdit(null);
        setStudentToDelete(null);
        setSelectedStudent(null);
    };

    const handleSaveStudent = (studentData: Omit<Student, 'id' | 'teacherId' | 'attendanceRate'>, id?: string) => {
        onSave(studentData, id);
        handleCloseModals();
    };

    const handleConfirmDelete = () => {
        if (studentToDelete) {
            onDelete(studentToDelete.id);
        }
        handleCloseModals();
    };

    const getHalaqaName = (halaqaId: string) => halaqat.find(h => h.id === halaqaId)?.name || 'غير محدد';

    const filteredStudents = useMemo(() => students.filter(student => {
        const teacherMatch = teacherId ? student.teacherId === teacherId : true;
        const nameMatch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
        const halaqaMatch = selectedHalaqa ? student.halaqaId === selectedHalaqa : true;
        const memorizationMatch = student.memorizationProgress >= minMemorization;
        return teacherMatch && nameMatch && halaqaMatch && memorizationMatch;
    }), [students, searchTerm, selectedHalaqa, minMemorization, teacherId]);
    
    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{teacherId ? 'طلابي' : 'إدارة الطلاب'}</h2>
                    {!teacherId && (
                        <button 
                            onClick={handleOpenAddModal}
                            className="flex items-center bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md">
                            <PlusIcon className="w-5 h-5 ml-2"/>
                            إضافة طالب جديد
                        </button>
                    )}
                </div>

                {/* Search and Filter Bar */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div>
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البحث بالاسم</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><SearchIcon className="w-5 h-5" /></span>
                                <input type="text" id="search" placeholder="ابحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="halaqaFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تصفية بالحلقة</label>
                            <select id="halaqaFilter" value={selectedHalaqa} onChange={(e) => setSelectedHalaqa(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white">
                                <option value="">كل الحلقات</option>
                                {halaqat.map(h => (<option key={h.id} value={h.id}>{h.name}</option>))}
                            </select>
                        </div>
                        <div>
                             <button onClick={() => { setSearchTerm(''); setSelectedHalaqa(''); setMinMemorization(0); }} className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-300 shadow-sm">مسح الفلاتر</button>
                        </div>
                    </div>
                    <div className="mt-4">
                         <label htmlFor="progressFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">أقل نسبة حفظ: <span className="font-bold text-green-700 dark:text-green-400">{minMemorization}%</span></label>
                        <input type="range" id="progressFilter" min="0" max="100" value={minMemorization} onChange={(e) => setMinMemorization(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"/>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-green-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم الطالب</th>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الحلقة</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">نسبة الحفظ</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">نسبة الحضور</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer" onClick={() => handleOpenProfileModal(student)}>
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{student.name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{getHalaqaName(student.halaqaId)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${student.memorizationProgress}%` }}></div>
                                            </div>
                                            <span className="text-sm font-medium">{student.memorizationProgress}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">
                                            <span className={`px-2 py-1 text-sm font-semibold rounded-full ${student.attendanceRate > 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}`}>{student.attendanceRate}%</span>
                                        </td>
                                        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleOpenEditModal(student)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 mx-1 transition-colors" aria-label={`تعديل ${student.name}`}><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleOpenDeleteModal(student)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 mx-1 transition-colors" aria-label={`حذف ${student.name}`}><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                        <p className="text-lg font-semibold">لا يوجد طلاب يطابقون معايير البحث.</p>
                                        <p>حاول تغيير فلاتر البحث أو إعادة تعيينها.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddStudentModal 
                isOpen={isAddEditModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveStudent}
                halaqat={halaqat}
                studentToEdit={studentToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف الطالب "${studentToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
            />

            {selectedStudent && (
                <StudentProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseModals}
                    student={selectedStudent}
                    halaqa={halaqat.find(h => h.id === selectedStudent.halaqaId)}
                    teacher={teachers.find(t => t.id === selectedStudent.teacherId)}
                    attendanceLogs={attendanceLogs}
                    onEdit={() => {
                        handleCloseModals();
                        handleOpenEditModal(selectedStudent);
                    }}
                />
            )}
        </>
    );
};
