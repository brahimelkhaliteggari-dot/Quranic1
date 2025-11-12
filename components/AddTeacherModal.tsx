import React, { useState, useEffect } from 'react';
import type { Teacher } from '../types';

interface AddTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (teacher: Omit<Teacher, 'id'>, id?: string) => Promise<void>;
    teacherToEdit?: Teacher | null;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, onSave, teacherToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; form?: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    const isEditMode = !!teacherToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setName(teacherToEdit.name);
                setEmail(teacherToEdit.email);
                setPassword('');
            } else {
                setName('');
                setEmail('');
                setPassword('');
            }
            setErrors({});
            setIsSaving(false);
        }
    }, [isOpen, teacherToEdit, isEditMode]);

    if (!isOpen) {
        return null;
    }

    const validate = () => {
        const newErrors: { name?: string; email?: string, password?: string } = {};
        if (!name.trim()) newErrors.name = 'اسم المعلم مطلوب';
        if (!email.trim()) {
            newErrors.email = 'البريد الإلكتروني مطلوب';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'صيغة البريد الإلكتروني غير صحيحة';
        }
        if (!isEditMode && !password) {
            newErrors.password = 'كلمة المرور مطلوبة';
        } else if (password && password.length < 6) {
            newErrors.password = 'كلمة المرور يجب أن لا تقل عن 6 أحرف';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async () => {
        if (!validate() || isSaving) return;

        setIsSaving(true);
        setErrors(prev => ({ ...prev, form: undefined }));

        const teacherData: Omit<Teacher, 'id'> = { name, email };
        if (password) {
            teacherData.password = password;
        }
        
        try {
            await onSave(teacherData, teacherToEdit?.id);
            onClose();
        } catch (error: any) {
            setErrors(prev => ({ ...prev, form: error.message || 'حدث خطأ غير متوقع' }));
        } finally {
            setIsSaving(false);
        }
    };

    const clearErrorOnChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrors({});
        setter(e.target.value);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{isEditMode ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none">&times;</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم الكامل</label>
                        <input 
                            type="text" 
                            id="teacher-name" 
                            value={name}
                            onChange={clearErrorOnChange(setName)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                        <input 
                            type="email"
                            id="email"
                            value={email}
                            onChange={clearErrorOnChange(setEmail)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                            placeholder="example@email.com"
                        />
                         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                        <input 
                            type="password"
                            id="password"
                            value={password}
                            onChange={clearErrorOnChange(setPassword)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'}`}
                            placeholder={isEditMode ? 'اتركه فارغاً لعدم التغيير' : '6 أحرف على الأقل'}
                        />
                         {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    {errors.form && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border-r-4 border-red-500 rounded-md">
                            <p className="text-sm text-center text-red-700 dark:text-red-300">{errors.form}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                        disabled={isSaving}
                    >
                        إلغاء
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                        disabled={isSaving}
                    >
                        {isSaving ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'حفظ المعلم')}
                    </button>
                </div>
            </div>
        </div>
    );
};