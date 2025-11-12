
import React, { useState, useEffect, useMemo } from 'react';
import type { Student, Halaqa, AttendanceLog } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface AttendanceProps {
    students: Student[];
    halaqat: Halaqa[];
    attendanceLogs: AttendanceLog[];
    teacherId?: string;
    onSave: (records: Record<string, AttendanceStatus>, halaqaId: string, teacherId: string) => Promise<void>;
}

type AttendanceStatus = 'present' | 'absent' | 'late';

export const Attendance: React.FC<AttendanceProps> = ({ students, halaqat, attendanceLogs, teacherId, onSave }) => {
    const [selectedHalaqa, setSelectedHalaqa] = useState<string>('');
    const [studentsInHalaqa, setStudentsInHalaqa] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceStatus>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [saveError, setSaveError] = useState<React.ReactNode | null>(null);
    const [filteredLogs, setFilteredLogs] = useState<AttendanceLog[]>([]);
    const [isTodaysLogLoaded, setIsTodaysLogLoaded] = useState(false);

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
            setIsTodaysLogLoaded(false); // Reset on halaqa change

            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const todaysLog = attendanceLogs.find(log => {
                if (log.halaqaId !== selectedHalaqa) return false;
                const logDate = new Date(log.date.seconds * 1000);
                return logDate >= todayStart && logDate <= todayEnd;
            });

            // Initialize records
            const initialRecords: Record<string, AttendanceStatus> = {};
            if (todaysLog) {
                // If today's log exists, load it, ensuring all current students are included
                filteredStudents.forEach(student => {
                    initialRecords[student.id] = todaysLog.records[student.id] || 'present';
                });
                setIsTodaysLogLoaded(true);
            } else {
                // Otherwise, default all students to present
                filteredStudents.forEach(student => {
                    initialRecords[student.id] = 'present';
                });
            }
            setAttendanceRecords(initialRecords);

        } else {
            setStudentsInHalaqa([]);
            setAttendanceRecords({});
            setIsTodaysLogLoaded(false);
        }
    }, [selectedHalaqa, students, attendanceLogs]);

     useEffect(() => {
        if (selectedHalaqa && attendanceLogs) {
            const logsForHalaqa = attendanceLogs
                .filter(log => log.halaqaId === selectedHalaqa)
                .sort((a, b) => b.date.seconds - a.date.seconds); // Sort descending
            setFilteredLogs(logsForHalaqa);
        } else {
            setFilteredLogs([]);
        }
    }, [selectedHalaqa, attendanceLogs]);
    
    const attendanceSummary = useMemo(() => {
        const counts: Record<AttendanceStatus, number> = {
            present: 0,
            absent: 0,
            late: 0,
        };
        Object.values(attendanceRecords).forEach(status => {
            if (status === 'present' || status === 'absent' || status === 'late') {
                counts[status]++;
            }
        });
        return counts;
    }, [attendanceRecords]);

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        setIsSaving(true);
        setSaveError(null);
        
        const currentTeacherId = teacherId || halaqat.find(h => h.id === selectedHalaqa)?.teacherId;
        if (!currentTeacherId) {
            setSaveError("لم يتم العثور على معرّف المعلم لهذه الحلقة.");
            setIsSaving(false);
            return;
        }

        try {
            await onSave(attendanceRecords, selectedHalaqa, currentTeacherId);
            setShowSuccessMessage(true);
            setTimeout(() => setShowSuccessMessage(false), 3000);
        } catch (error: any) {
            console.error("Failed to save attendance:", error);
            if (error.message === "permission-denied") {
                setSaveError(
                    <div className="text-right text-sm">
                        <p className="font-bold mb-2">خطأ في الصلاحيات: فشل حفظ الحضور.</p>
                        <p>يبدو أن قواعد أمان Firestore تمنع الكتابة. يرجى مراجعة قواعد الأمان في لوحة تحكم Firebase والتأكد من السماح بالكتابة في مجموعة <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">daily_attendance</code>.</p>
                    </div>
                );
            } else {
                 setSaveError("حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const StatusButton: React.FC<{
        label: string;
        status: AttendanceStatus;
        currentStatus: AttendanceStatus;
        onClick: () => void;
    }> = ({ label, status, currentStatus, onClick }) => {
        const isActive = status === currentStatus;
        const baseClasses = "font-bold py-2 px-4 rounded-md transition-all duration-200 w-24 text-sm";
        const colorClasses = {
            present: isActive ? 'bg-green-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 border border-green-600 dark:border-green-500 hover:bg-green-50 dark:hover:bg-gray-600',
            absent: isActive ? 'bg-red-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-gray-600',
            late: isActive ? 'bg-amber-500 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-amber-500 dark:text-amber-400 border border-amber-500 dark:border-amber-500 hover:bg-amber-50 dark:hover:bg-gray-600',
        };
        return <button onClick={onClick} className={`${baseClasses} ${colorClasses[status]}`}>{label}</button>;
    };

    const AttendanceLogTable: React.FC<{ logs: AttendanceLog[] }> = ({ logs }) => {
        const calculateStats = (records: Record<string, AttendanceStatus>) => {
            const counts = { present: 0, absent: 0, late: 0 };
            Object.values(records).forEach(status => {
                if(status === 'present') counts.present++;
                if(status === 'absent') counts.absent++;
                if(status === 'late') counts.late++;
            });
            return counts;
        };

        const formatDate = (timestamp: { seconds: number }) => {
            return new Intl.DateTimeFormat('ar-SA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(new Date(timestamp.seconds * 1000));
        };

        if (logs.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 mt-8">
                    <p>لا يوجد سجل حضور سابق لهذه الحلقة.</p>
                </div>
            )
        }

        return (
            <div className="mt-10 pt-6 border-t dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">سجل الحضور (آخر 7 أيام)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">التاريخ</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">حاضر</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">غائب</th>
                                <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">متأخر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => {
                                const stats = calculateStats(log.records);
                                return (
                                    <tr key={log.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{formatDate(log.date)}</td>
                                        <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-semibold">{stats.present}</td>
                                        <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-semibold">{stats.absent}</td>
                                        <td className="px-4 py-3 text-center text-amber-600 dark:text-amber-400 font-semibold">{stats.late}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">متابعة الحضور</h2>
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
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">تسجيل حضور ليوم: <span className="text-green-800 dark:text-green-400">{dateString}</span></p>
                        {isTodaysLogLoaded && <p className="text-sm text-green-700 dark:text-green-500 mt-1">تم تحميل سجل الحضور المحفوظ لهذا اليوم. يمكنك تعديله وحفظه مجدداً.</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border-r-4 border-green-500">
                            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400 ml-4" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">حاضر</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{attendanceSummary.present}</p>
                            </div>
                        </div>
                         <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border-r-4 border-red-500">
                            <XCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400 ml-4" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">غائب</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{attendanceSummary.absent}</p>
                            </div>
                        </div>
                         <div className="flex items-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-r-4 border-amber-500">
                            <ClockIcon className="w-8 h-8 text-amber-500 dark:text-amber-400 ml-4" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">متأخر</p>
                                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{attendanceSummary.late}</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3 w-1/3">اسم الطالب</th>
                                    <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentsInHalaqa.map(student => (
                                    <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{student.name}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center items-center gap-2">
                                                <StatusButton label="حاضر" status="present" currentStatus={attendanceRecords[student.id]} onClick={() => handleStatusChange(student.id, 'present')} />
                                                <StatusButton label="غائب" status="absent" currentStatus={attendanceRecords[student.id]} onClick={() => handleStatusChange(student.id, 'absent')} />
                                                <StatusButton label="متأخر" status="late" currentStatus={attendanceRecords[student.id]} onClick={() => handleStatusChange(student.id, 'late')} />
                                            </div>
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
                                    تم حفظ الحضور بنجاح!
                                </div>
                            )}
                            <button 
                                onClick={handleSaveAttendance}
                                disabled={isSaving}
                                className="bg-green-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-800 transition-colors duration-300 shadow-md disabled:bg-green-400 disabled:cursor-not-allowed">
                                {isSaving ? 'جاري الحفظ...' : 'حفظ الحضور'}
                            </button>
                        </div>
                    </div>

                    <AttendanceLogTable logs={filteredLogs} />
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                        {teacherId && availableHalaqat.length === 0 
                            ? "لم يتم إسناد أي حلقات لك بعد." 
                            : "الرجاء اختيار حلقة لعرض الطلاب وتسجيل الحضور."
                        }
                    </p>
                </div>
            )}
        </div>
    );
};
