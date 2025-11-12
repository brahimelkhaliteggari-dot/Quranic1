
import React, { useState, useEffect } from 'react';
import type { Student, Halaqa } from '../types';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (student: Omit<Student, 'id' | 'teacherId' | 'attendanceRate'>, id?: string) => void;
    halaqat: Halaqa[];
    studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onSave, halaqat, studentToEdit }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [fatherPhoneNumber, setFatherPhoneNumber] = useState('');
    const [halaqaId, setHalaqaId] = useState<string>('');
    const [memorizationProgress, setMemorizationProgress] = useState(0);
    const [errors, setErrors] = useState<{ name?: string; age?: string; fatherPhoneNumber?: string }>({});

    const isEditMode = !!studentToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(studentToEdit.name);
                setAge(studentToEdit.age);
                setFatherPhoneNumber(studentToEdit.fatherPhoneNumber || '');
                setHalaqaId(studentToEdit.halaqaId);
                setMemorizationProgress(studentToEdit.memorizationProgress);
            } else {
                setName('');
                setAge('');
                setFatherPhoneNumber('');
                setHalaqaId(halaqat[0]?.id || '');
                setMemorizationProgress(0);
            }
            setErrors({});
        }
    }, [isOpen, studentToEdit, isEditMode, halaqat]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors: { name?: string; age?: string; fatherPhoneNumber?: string } = {};
        if (!name.trim()) newErrors.name = 'اسم الطالب مطلوب';
        if (!age) newErrors.age = 'عمر الطالب مطلوب';
        else if (age <= 0) newErrors.age = 'العمر يجب أن يكون رقماً موجباً';
        if (fatherPhoneNumber && !/^\+?[0-9\s]+$/.test(fatherPhoneNumber)) {
            newErrors.fatherPhoneNumber = 'رقم الهاتف يجب أن يحتوي على أرقام فقط';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = () => {
        if (!validate()) return;
        onSave({
            name,
            age: Number(age),
            fatherPhoneNumber,
            halaqaId,
            memorizationProgress,
        }, studentToEdit?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isEditMode ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}/>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العمر</label>
                        <input type="number" id="age" value={age} onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}/>
                         {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                    </div>
                     <div>
                        <label htmlFor="fatherPhoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم هاتف ولي الأمر (للتواصل)</label>
                        <input type="tel" id="fatherPhoneNumber" value={fatherPhoneNumber} onChange={e => setFatherPhoneNumber(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-left dir-ltr bg-gray-50 dark:bg-gray-700 dark:text-white ${errors.fatherPhoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`} placeholder="05xxxxxxxx"/>
                         {errors.fatherPhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.fatherPhoneNumber}</p>}
                    </div>
                    <div>
                        <label htmlFor="halaqa" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الحلقة</label>
                        <select id="halaqa" value={halaqaId} onChange={e => setHalaqaId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white">
                            {halaqat.map(halaqa => (<option key={halaqa.id} value={halaqa.id}>{halaqa.name}</option>))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="progress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نسبة الحفظ: <span className="font-bold text-green-700 dark:text-green-400">{memorizationProgress}%</span></label>
                        <input type="range" id="progress" min="0" max="100" value={memorizationProgress} onChange={e => setMemorizationProgress(Number(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"/>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">إلغاء</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors">{isEditMode ? 'حفظ التعديلات' : 'حفظ الطالب'}</button>
                </div>
            </div>
        </div>
    );
};