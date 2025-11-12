import React, { useState, useMemo } from 'react';
import type { Halaqa, Teacher } from '../types';
import { AddHalaqaModal } from './AddHalaqaModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface HalaqatProps {
  halaqat: Halaqa[];
  teachers: Teacher[];
  onSave: (halaqaData: Omit<Halaqa, 'id' | 'studentCount'>, id?: string) => void;
  onDelete: (id: string) => void;
  teacherId?: string;
}

export const Halaqat: React.FC<HalaqatProps> = ({ halaqat, teachers, onSave, onDelete, teacherId }) => {
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [halaqaToEdit, setHalaqaToEdit] = useState<Halaqa | null>(null);
    const [halaqaToDelete, setHalaqaToDelete] = useState<Halaqa | null>(null);

    const handleOpenAddModal = () => {
        setHalaqaToEdit(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (halaqa: Halaqa) => {
        setHalaqaToEdit(halaqa);
        setIsAddEditModalOpen(true);
    };

    const handleOpenDeleteModal = (halaqa: Halaqa) => {
        setHalaqaToDelete(halaqa);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsAddEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setHalaqaToEdit(null);
        setHalaqaToDelete(null);
    };

    const handleSaveHalaqa = (halaqaData: Omit<Halaqa, 'id' | 'studentCount'>, id?: string) => {
        onSave(halaqaData, id);
        handleCloseModals();
    };
    
    const handleConfirmDelete = () => {
        if (halaqaToDelete) {
            onDelete(halaqaToDelete.id);
        }
        handleCloseModals();
    };

    const getTeacherName = (teacherId: string) => {
        return teachers.find(t => t.id === teacherId)?.name || 'غير محدد';
    }

    const displayedHalaqat = useMemo(() => 
        teacherId ? halaqat.filter(h => h.teacherId === teacherId) : halaqat,
    [halaqat, teacherId]);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{teacherId ? 'حلقاتي' : 'إدارة الحلقات'}</h2>
                     {!teacherId && (
                        <button 
                            onClick={handleOpenAddModal}
                            className="flex items-center bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md">
                            <PlusIcon className="w-5 h-5 ml-2"/>
                            إضافة حلقة جديدة
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-green-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم الحلقة</th>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">المعلم المسؤول</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">عدد الطلاب</th>
                                {!teacherId && <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">إجراءات</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {displayedHalaqat.map((halaqa) => (
                                <tr key={halaqa.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{halaqa.name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{getTeacherName(halaqa.teacherId)}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{halaqa.studentCount}</td>
                                    {!teacherId && (
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleOpenEditModal(halaqa)}
                                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 mx-1 transition-colors"
                                                aria-label={`تعديل ${halaqa.name}`}
                                            >
                                                <PencilIcon className="w-5 h-5"/>
                                            </button>
                                            <button 
                                                onClick={() => handleOpenDeleteModal(halaqa)}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 mx-1 transition-colors"
                                                aria-label={`حذف ${halaqa.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5"/>
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddHalaqaModal 
                isOpen={isAddEditModalOpen}
                onClose={handleCloseModals}
                onSave={handleSaveHalaqa}
                teachers={teachers}
                halaqaToEdit={halaqaToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف حلقة "${halaqaToDelete?.name}"؟ سيؤثر هذا على الطلاب المسجلين فيها.`}
            />
        </>
    );
};
