
import React, { useState, useMemo } from 'react';
import type { Teacher, Halaqa, Student } from '../types';
import { AddTeacherModal } from './AddTeacherModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { TeacherProfileModal } from './TeacherProfileModal';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TeachersProps {
    teachers: Teacher[];
    halaqat: Halaqa[];
    students: Student[];
    onSave: (teacherData: Omit<Teacher, 'id'>, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export const Teachers: React.FC<TeachersProps> = ({ teachers, halaqat, students, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [teacherToEdit, setTeacherToEdit] = useState<Teacher | null>(null);
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

    const handleOpenAddModal = () => {
        setTeacherToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (teacher: Teacher) => {
        setTeacherToEdit(teacher);
        setIsModalOpen(true);
    };
    
    const handleOpenProfileModal = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setIsProfileModalOpen(true);
    };

    const handleOpenDeleteModal = (teacher: Teacher) => {
        setTeacherToDelete(teacher);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsProfileModalOpen(false);
        setTeacherToEdit(null);
        setTeacherToDelete(null);
        setSelectedTeacher(null);
    };

    const handleConfirmDelete = () => {
        if (teacherToDelete) {
            onDelete(teacherToDelete.id);
        }
        handleCloseModals();
    };

    const selectedTeacherData = useMemo(() => {
        if (!selectedTeacher) return null;

        const assignedHalaqat = halaqat.filter(h => h.teacherId === selectedTeacher.id);
        const studentsOfTeacher = students.filter(s => s.teacherId === selectedTeacher.id);
        const studentCount = studentsOfTeacher.length;
        const totalMemorization = studentsOfTeacher.reduce((acc, student) => acc + student.memorizationProgress, 0);
        const averageMemorization = studentCount > 0 ? Math.round(totalMemorization / studentCount) : 0;
        
        return {
            assignedHalaqat,
            studentCount,
            averageMemorization
        };
    }, [selectedTeacher, halaqat, students]);


    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">إدارة المعلمين</h2>
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md">
                        <PlusIcon className="w-5 h-5 ml-2"/>
                        إضافة معلم جديد
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-green-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم المعلم</th>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">البريد الإلكتروني</th>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الحلقات المسندة</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">عدد الطلاب</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teachers.map((teacher) => {
                                const assignedHalaqat = halaqat.filter(h => h.teacherId === teacher.id);
                                const studentCount = students.filter(s => s.teacherId === teacher.id).length;
                                
                                return (
                                <tr 
                                    key={teacher.id} 
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => handleOpenProfileModal(teacher)}
                                >
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{teacher.name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{teacher.email}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {assignedHalaqat.length > 0 ? assignedHalaqat.map(h => h.name).join('، ') : 'لا يوجد'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{studentCount}</td>
                                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={() => handleOpenEditModal(teacher)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 mx-1 transition-colors"
                                            aria-label={`تعديل ${teacher.name}`}
                                        >
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button 
                                            onClick={() => handleOpenDeleteModal(teacher)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 mx-1 transition-colors"
                                            aria-label={`حذف ${teacher.name}`}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddTeacherModal 
                isOpen={isModalOpen}
                onClose={handleCloseModals}
                onSave={onSave}
                teacherToEdit={teacherToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف المعلم "${teacherToDelete?.name}"؟ سيتم حذف بياناته وإلغاء إسناد حلقاته. ملاحظة هامة: يجب حذف حساب تسجيل الدخول الخاص به يدوياً من لوحة تحكم Firebase Authentication.`}
            />

            {selectedTeacher && selectedTeacherData && (
                <TeacherProfileModal
                    isOpen={isProfileModalOpen}
                    onClose={handleCloseModals}
                    onEdit={() => {
                        handleCloseModals();
                        handleOpenEditModal(selectedTeacher);
                    }}
                    teacher={selectedTeacher}
                    assignedHalaqat={selectedTeacherData.assignedHalaqat}
                    studentCount={selectedTeacherData.studentCount}
                    averageMemorization={selectedTeacherData.averageMemorization}
                />
            )}
        </>
    );
};
