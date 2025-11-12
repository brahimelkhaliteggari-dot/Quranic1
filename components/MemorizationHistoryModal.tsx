
import React from 'react';
import type { Student, MemorizationLog } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface MemorizationHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student;
    history: MemorizationLog[];
    isLoading: boolean;
    error?: React.ReactNode | null;
}

const QualityBadge: React.FC<{ quality: 'good' | 'average' | 'repeat' }> = ({ quality }) => {
    const qualityStyles = {
        good: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        average: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        repeat: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    };
    const qualityText = {
        good: 'جيد',
        average: 'متوسط',
        repeat: 'إعادة',
    };
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${qualityStyles[quality]}`}>
            {qualityText[quality]}
        </span>
    );
};

export const MemorizationHistoryModal: React.FC<MemorizationHistoryModalProps> = ({ isOpen, onClose, student, history, isLoading, error }) => {
    if (!isOpen) return null;

    const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
        if (!timestamp?.seconds) return '...';
        return new Date(timestamp.seconds * 1000).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-t-lg">
                    <div className="flex items-center gap-3">
                        <HistoryIcon className="w-6 h-6 text-green-700 dark:text-green-500"/>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            سجل المحفوظات لـ: <span className="text-green-800 dark:text-green-400">{student.name}</span>
                        </h2>
                    </div>
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-3xl leading-none">&times;</button>
                </div>
                
                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <p className="text-gray-600 dark:text-gray-400">جاري تحميل السجل...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-r-4 border-red-500 rounded-md flex items-start gap-4">
                            <ExclamationIcon className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                            <div>{error}</div>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
                                لا يوجد سجل محفوظات لهذا الطالب بعد.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                ابدأ بتسجيل الحفظ اليومي وستظهر النتائج هنا.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <thead className="bg-green-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">التاريخ</th>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">السورة</th>
                                        <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الآيات</th>
                                        <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">التقييم</th>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map(log => (
                                        <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(log.date)}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{log.surah}</td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center" dir="ltr">{log.fromVerse} - {log.toVerse}</td>
                                            <td className="px-4 py-3 text-center"><QualityBadge quality={log.quality} /></td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">{log.notes || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg border-t dark:border-gray-700">
                     <button 
                        onClick={onClose} 
                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                    >
                        إغلاق
                    </button>
                </div>
            </div>
        </div>
    );
};