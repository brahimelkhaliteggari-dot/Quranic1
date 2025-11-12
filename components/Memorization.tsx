import React, { useState, useEffect, useMemo } from 'react';
import type { Student, Halaqa, MemorizationLog } from '../types';
import { quranSurahs } from '../data/quran';
import { MemorizationHistoryModal } from './MemorizationHistoryModal';
import { db, firebaseConfig } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';


interface MemorizationProps {
    students: Student[];
    halaqat: Halaqa[];
    onSave: (records: Record<string, MemorizationRecord>, halaqaId: string, teacherId: string) => Promise<void>;
    teacherId?: string;
}

interface MemorizationRange {
    surah: string;
    from: number | '';
    to: number | '';
}

type MemorizationQuality = 'good' | 'average' | 'repeat';

interface MemorizationRecord {
    newMemorization: MemorizationRange;
    quality: MemorizationQuality;
    notes: string;
}

const MemorizationInputGroup: React.FC<{
    value: MemorizationRange;
    onChange: (field: keyof MemorizationRange, value: string | number) => void;
}> = ({ value, onChange }) => {
    const selectedSurah = quranSurahs.find(s => s.name === value.surah);
    const maxVerse = selectedSurah ? selectedSurah.verse_count : undefined;

    return (
        <div className="flex flex-wrap items-center gap-2">
            <select
                value={value.surah}
                onChange={(e) => onChange('surah', e.target.value)}
                className="flex-grow min-w-[120px] px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
            >
                <option value="" disabled>اختر السورة</option>
                {quranSurahs.map(surah => (
                    <option key={surah.id} value={surah.name}>{surah.name}</option>
                ))}
            </select>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="من"
                    min="1"
                    max={maxVerse}
                    value={value.from}
                    onChange={(e) => onChange('from', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                    disabled={!value.surah}
                    aria-label="From verse"
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <input
                    type="number"
                    placeholder="إلى"
                    min={value.from || 1}
                    max={maxVerse}
                    value={value.to}
                    onChange={(e) => onChange('to', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                    disabled={!value.surah}
                    aria-label="To verse"
                />
            </div>
            {selectedSurah && <span className="text-xs text-gray-500 dark:text-gray-400">(آياتها {maxVerse})</span>}
        </div>
    );
};


export const Memorization: React.FC<MemorizationProps> = ({ students, halaqat, onSave, teacherId }) => {
    const [selectedHalaqa, setSelectedHalaqa] = useState<string>('');
    const [studentsInHalaqa, setStudentsInHalaqa] = useState<Student[]>([]);
    const [memorizationRecords, setMemorizationRecords] = useState<Record<string, MemorizationRecord>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [saveError, setSaveError] = useState<React.ReactNode | null>(null);
    
    // State for history modal
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyData, setHistoryData] = useState<MemorizationLog[]>([]);
    const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<Student | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<React.ReactNode | null>(null);
    
    const today = new Date();
    const dateString = new Intl.DateTimeFormat('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(today);
    
    const availableHalaqat = useMemo(() => {
        if (teacherId) {
            return halaqat.filter(h => h.teacherId === teacherId);
        }
        return halaqat;
    }, [halaqat, teacherId]);

    useEffect(() => {
        if (availableHalaqat.length > 0) {
            if (!availableHalaqat.find(h => h.id === selectedHalaqa)) {
                setSelectedHalaqa(availableHalaqat[0].id);
            }
        } else {
            setSelectedHalaqa('');
        }
    }, [availableHalaqat, selectedHalaqa]);

    useEffect(() => {
        if (selectedHalaqa) {
            const filteredStudents = students.filter(s => s.halaqaId === selectedHalaqa);
            setStudentsInHalaqa(filteredStudents);
            
            // Initialize empty records for students
            const initialRecords: Record<string, MemorizationRecord> = {};
            filteredStudents.forEach(student => {
                initialRecords[student.id] = {
                    newMemorization: { surah: '', from: '', to: '' },
                    quality: 'good',
                    notes: ''
                };
            });
            setMemorizationRecords(initialRecords);
        } else {
            setStudentsInHalaqa([]);
            setMemorizationRecords({});
        }
    }, [selectedHalaqa, students]);

    const handleRecordChange = (studentId: string, field: keyof MemorizationRange, value: string | number) => {
        const numericValue = (field === 'from' || field === 'to') && value !== '' ? Math.max(0, Number(value)) : value;
    
        setMemorizationRecords(prev => {
            const studentRecord = prev[studentId];
    
            const updatedRecord = {
                ...studentRecord,
                newMemorization: {
                    ...studentRecord.newMemorization,
                    [field]: numericValue
                }
            };

            // If 'from' is updated, ensure 'to' is not smaller
            if (field === 'from' && typeof numericValue === 'number' && updatedRecord.newMemorization.to !== '' && numericValue > Number(updatedRecord.newMemorization.to)) {
                updatedRecord.newMemorization.to = numericValue;
            }

            // Reset verses if surah is changed
            if (field === 'surah') {
                updatedRecord.newMemorization.from = '';
                updatedRecord.newMemorization.to = '';
            }
    
            return {
                ...prev,
                [studentId]: updatedRecord
            };
        });
    };
    
    const handleQualityChange = (studentId: string, quality: MemorizationQuality) => {
        setMemorizationRecords(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                quality: quality
            }
        }));
    };

    const handleNotesChange = (studentId: string, value: string) => {
        setMemorizationRecords(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                notes: value
            }
        }));
    };

    const handleSaveMemorization = async () => {
        setIsSaving(true);
        setShowSuccessMessage(false);
        setSaveError(null);
        
        const currentTeacherId = teacherId || halaqat.find(h => h.id === selectedHalaqa)?.teacherId;
        if (!currentTeacherId) {
            console.error("Teacher ID not found for this halaqa");
            setSaveError("لم يتم العثور على معرّف المعلم لهذه الحلقة.");
            setIsSaving(false);
            return;
        }

        try {
            await onSave(memorizationRecords, selectedHalaqa, currentTeacherId);
            
            // Reset form after saving
            const initialRecords: Record<string, MemorizationRecord> = {};
            studentsInHalaqa.forEach(student => {
                initialRecords[student.id] = {
                    newMemorization: { surah: '', from: '', to: '' },
                    quality: 'good',
                    notes: ''
                };
            });
            setMemorizationRecords(initialRecords);

            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error: any) {
            console.error("Failed to save:", error);
            if (error.code === 'permission-denied' || error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
                setSaveError(
                    <div className="text-right text-sm">
                        <p className="font-bold mb-2">خطأ في الصلاحيات: فشل حفظ البيانات.</p>
                        <p className="mb-2">يبدو أن قواعد أمان Firestore تمنع حاليًا الكتابة في مجموعة 'memorization_logs'.</p>
                        <p className="font-semibold">لحل المشكلة:</p>
                        <ol className="list-decimal list-inside my-2 space-y-1">
                            <li>اذهب إلى مشروعك في لوحة تحكم Firebase.</li>
                            <li>اذهب إلى <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Firestore Database</code> ثم <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">Rules</code>.</li>
                            <li>أضف القاعدة التالية داخل قسم <code>match /databases/&#123;database&#125;/documents &#123; ... &#125;</code>:</li>
                        </ol>
                        <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-xs text-left my-2" dir="ltr">
                            <code>
    {`
    match /memorization_logs/{logId} {
      // Allow any authenticated user to create and read logs.
      allow read, create: if request.auth != null;
    }
    `}
                            </code>
                        </pre>
                        <p className="mt-2">4. اضغط على <strong>Publish</strong> لحفظ القاعدة الجديدة.</p>
                    </div>
                );
            } else {
                setSaveError("حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.");
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleViewHistory = async (student: Student) => {
        setSelectedStudentForHistory(student);
        setIsHistoryModalOpen(true);
        setIsHistoryLoading(true);
        setHistoryError(null); // Reset error on new fetch
        try {
            const q = query(
                collection(db, "memorization_logs"), 
                where("studentId", "==", student.id),
                orderBy("date", "desc")
            );
            const querySnapshot = await getDocs(q);
            const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MemorizationLog[];
            setHistoryData(logs);
        } catch (error: any) {
            console.error("Error fetching memorization history:", error);
            // This error code indicates a missing index in Firestore
            if (error.code === 'failed-precondition') {
                 // Use the exact link from the error message for convenience
                 const indexCreationLink = `https://console.firebase.google.com/v1/r/project/${firebaseConfig.projectId}/firestore/indexes?create_composite=Cldwcm9qZWN0cy9xdXJhbmljLTJjN2Y1L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZW1vcml6YXRpb25fbG9ncy9pbmRleGVzL18QARoNCglzdHVkZW50SWQQARoICgRkYXRlEAIaDAoIX19uYW1lX18QAg`;

                 setHistoryError(
                    <div className="text-right text-sm">
                        <p className="font-bold mb-2 text-base text-red-800 dark:text-red-300">خطأ: فهرس قاعدة البيانات مطلوب.</p>
                        <p className="mb-2">لعرض سجل الحفظ، يتطلب Firestore إنشاء فهرس (index) لتحسين سرعة البحث. هذه عملية تتم لمرة واحدة فقط.</p>
                        <p className="font-semibold mt-4">لحل المشكلة:</p>
                        <ol className="list-decimal list-inside my-2 space-y-2">
                            <li>اضغط على الرابط أدناه للانتقال إلى صفحة إنشاء الفهارس في مشروعك على Firebase.</li>
                            <li>سيتم فتح نافذة جديدة مع تعبئة الحقول تلقائياً.</li>
                            <li>اضغط على زر "Create" وانتظر بضع دقائق حتى يتم إنشاء الفهرس (قد تظهر الحالة "Building").</li>
                            <li>بعد اكتمال الإنشاء (الحالة "Enabled")، أعد فتح هذه النافذة لعرض السجل.</li>
                        </ol>
                        <a 
                            href={indexCreationLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-block w-full text-center mt-3 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-semibold"
                        >
                            إنشاء الفهرس المطلوب في Firebase
                        </a>
                    </div>
                );

            } else {
                 setHistoryError("حدث خطأ غير متوقع أثناء جلب السجل.");
            }
            setHistoryData([]);
        } finally {
            setIsHistoryLoading(false);
        }
    };


    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">متابعة الحفظ اليومي</h2>
                    <div>
                        <label htmlFor="halaqa-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            اختر الحلقة
                        </label>
                        <select
                            id="halaqa-select"
                            value={selectedHalaqa}
                            onChange={e => setSelectedHalaqa(e.target.value)}
                            className="w-full md:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                            disabled={availableHalaqat.length === 0}
                        >
                            {availableHalaqat.length === 0 ? (
                            <option>لا يوجد حلقات مسندة</option>
                            ) : (
                            <>
                                <option value="" disabled>-- اختر حلقة --</option>
                                {availableHalaqat.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </>
                            )}
                        </select>
                    </div>
                </div>

                {selectedHalaqa ? (
                    <>
                        <div className="bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500 p-4 rounded-md mb-6">
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">تسجيل الحفظ ليوم: <span className="text-green-800 dark:text-green-400">{dateString}</span></p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم الطالب</th>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الحفظ الجديد</th>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">التقييم</th>
                                        <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">ملاحظات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentsInHalaqa.map(student => (
                                        <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium align-top">
                                                <button onClick={() => handleViewHistory(student)} className="text-right hover:text-green-700 dark:hover:text-green-400 font-semibold transition-colors">
                                                    {student.name}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <MemorizationInputGroup
                                                    value={memorizationRecords[student.id]?.newMemorization}
                                                    onChange={(field, value) => handleRecordChange(student.id, field, value)}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <select
                                                    value={memorizationRecords[student.id]?.quality || 'good'}
                                                    onChange={(e) => handleQualityChange(student.id, e.target.value as MemorizationQuality)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                                                    aria-label="Evaluation"
                                                >
                                                    <option value="good">حفظ جيد</option>
                                                    <option value="average">حفظ متوسط</option>
                                                    <option value="repeat">اعادة حفظ</option>
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="text"
                                                    placeholder="ملاحظات..."
                                                    value={memorizationRecords[student.id]?.notes || ''}
                                                    onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="mt-6 flex flex-col items-end gap-4">
                             {saveError && (
                                <div className="w-full p-4 bg-red-100 dark:bg-red-900/30 border-r-4 border-red-500 rounded-md">
                                    <div className="text-red-700 dark:text-red-300">{saveError}</div>
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                {showSuccessMessage && (
                                    <div className="text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50 py-2 px-4 rounded-md transition-opacity duration-300">
                                        تم حفظ التسميع بنجاح!
                                    </div>
                                )}
                                <button 
                                    onClick={handleSaveMemorization}
                                    disabled={isSaving}
                                    className="bg-green-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed">
                                    {isSaving ? 'جاري الحفظ...' : 'حفظ التسميع'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                            {teacherId && availableHalaqat.length === 0 
                                ? "لم يتم إسناد أي حلقات لك بعد." 
                                : "الرجاء اختيار حلقة لعرض الطلاب وتسجيل الحفظ."
                            }
                        </p>
                    </div>
                )}
            </div>
            {selectedStudentForHistory && (
                <MemorizationHistoryModal
                    isOpen={isHistoryModalOpen}
                    onClose={() => setIsHistoryModalOpen(false)}
                    student={selectedStudentForHistory}
                    history={historyData}
                    isLoading={isHistoryLoading}
                    error={historyError}
                />
            )}
        </>
    );
};