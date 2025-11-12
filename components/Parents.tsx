
import React, { useState, useMemo } from 'react';
import type { Parent, Student } from '../types';
import { AddParentModal } from './AddParentModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ParentsProps {
    parents: Parent[];
    students: Student[];
    onSave: (parentData: Omit<Parent, 'id'>, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export const Parents: React.FC<ParentsProps> = ({ parents, students, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [parentToEdit, setParentToEdit] = useState<Parent | null>(null);
    const [parentToDelete, setParentToDelete] = useState<Parent | null>(null);

    const handleOpenAddModal = () => {
        setParentToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (parent: Parent) => {
        setParentToEdit(parent);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (parent: Parent) => {
        setParentToDelete(parent);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setParentToEdit(null);
        setParentToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (parentToDelete) {
            onDelete(parentToDelete.id);
        }
        handleCloseModals();
    };
    
    const getChildrenCount = (parentId: string) => {
        return students.filter(s => s.parentId === parentId).length;
    }

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">إدارة أولياء الأمور</h2>
                    <button 
                        onClick={handleOpenAddModal}
                        className="flex items-center bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md">
                        <PlusIcon className="w-5 h-5 ml-2"/>
                        إضافة ولي أمر جديد
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-green-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم ولي الأمر</th>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">البريد الإلكتروني</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">عدد الأبناء</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.map((parent) => (
                                <tr key={parent.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{parent.name}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{parent.email}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{getChildrenCount(parent.id)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button 
                                            onClick={() => handleOpenEditModal(parent)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 mx-1 transition-colors"
                                            aria-label={`تعديل ${parent.name}`}
                                        >
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button 
                                            onClick={() => handleOpenDeleteModal(parent)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 mx-1 transition-colors"
                                            aria-label={`حذف ${parent.name}`}
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddParentModal 
                isOpen={isModalOpen}
                onClose={handleCloseModals}
                onSave={onSave}
                parentToEdit={parentToEdit}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onConfirm={handleConfirmDelete}
                title="تأكيد الحذف"
                message={`هل أنت متأكد من رغبتك في حذف ولي الأمر "${parentToDelete?.name}"؟ سيتم فك ربطه عن جميع أبنائه. ملاحظة: يجب حذف حساب دخوله يدوياً من Firebase.`}
            />
        </>
    );
};
