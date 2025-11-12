import React, { useState, useEffect } from 'react';
import type { Halaqa, Teacher } from '../types';

interface AddHalaqaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (halaqa: Omit<Halaqa, 'id' | 'studentCount'>, id?: string) => void;
    teachers: Teacher[];
    halaqaToEdit?: Halaqa | null;
}

export const AddHalaqaModal: React.FC<AddHalaqaModalProps> = ({ isOpen, onClose, onSave, teachers, halaqaToEdit }) => {
    const [name, setName] = useState('');
    const [teacherId, setTeacherId] = useState<string>('');
    const [errors, setErrors] = useState<{ name?: string; teacherId?: string }>({});

    const isEditMode = !!halaqaToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(halaqaToEdit.name);
                setTeacherId(halaqaToEdit.teacherId);
            } else {
                setName('');
                setTeacherId(teachers[0]?.id || '');
            }
            setErrors({});
        }
    }, [isOpen, halaqaToEdit, isEditMode, teachers]);

    if (!isOpen) {
        return null;
    }

    const validate = () => {
        const newErrors: { name?: string; teacherId?: string } = {};
        if (!name.trim()) newErrors.name = 'اسم الحلقة مطلوب';
        if (!teacherId) newErrors.teacherId = 'يجب اختيار معلم للحلقة';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({ name, teacherId }, halaqaToEdit?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isEditMode ? 'تعديل بيانات الحلقة' : 'إضافة حلقة جديدة'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="halaqa-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">اسم الحلقة</label>
                        <input 
                            type="text" 
                            id="halaqa-name" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المعلم المسؤول</label>
                        <select 
                            id="teacher" 
                            value={teacherId}
                            onChange={e => setTeacherId(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:text-white ${errors.teacherId ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                        >
                            <option value="" disabled>-- اختر معلم --</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                         {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId}</p>}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors"
                    >
                        {isEditMode ? 'حفظ التعديلات' : 'حفظ الحلقة'}
                    </button>
                </div>
            </div>
        </div>
    );
};