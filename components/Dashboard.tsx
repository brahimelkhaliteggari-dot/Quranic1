
import React, { useMemo } from 'react';
import type { Student, Halaqa, Teacher, AttendanceLog, ActivityLog } from '../types';
import { StatCard } from './StatCard';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DashboardProps {
    students: Student[];
    teachers: Teacher[];
    halaqat: Halaqa[];
    attendanceLogs: AttendanceLog[];
    activityLogs: ActivityLog[];
}

const formatTimeAgo = (timestamp: { seconds: number }) => {
    if (!timestamp?.seconds) return '';
    const now = new Date();
    const activityDate = new Date(timestamp.seconds * 1000);
    const seconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `قبل ${Math.floor(interval)} سنوات`;
    interval = seconds / 2592000;
    if (interval > 1) return `قبل ${Math.floor(interval)} أشهر`;
    interval = seconds / 86400;
    if (interval > 1) return `قبل ${Math.floor(interval)} أيام`;
    interval = seconds / 3600;
    if (interval > 1) return `قبل ${Math.floor(interval)} ساعات`;
    interval = seconds / 60;
    if (interval > 1) return `قبل ${Math.floor(interval)} دقائق`;
    return 'قبل لحظات';
};

const ActivityItem: React.FC<{ log: ActivityLog }> = ({ log }) => {
    let icon, colorClasses, text;

    switch (log.type) {
        case 'new_student':
            icon = <UsersIcon className="h-5 w-5"/>;
            colorClasses = 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
            text = (
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    تم إضافة طالب جديد: <span className="text-green-700 dark:text-green-400">{log.details.studentName}</span>
                </p>
            );
            break;
        case 'memorization_log':
            icon = <BookOpenIcon className="h-5 w-5"/>;
            colorClasses = 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300';
            text = (
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    إنجاز جديد: <span className="text-amber-700 dark:text-amber-400">{log.details.studentName}</span> سمّع <span className="text-amber-700 dark:text-amber-400">سورة {log.details.surah}</span>
                </p>
            );
            break;
        case 'absence_log':
            icon = <ClipboardListIcon className="h-5 w-5"/>;
            colorClasses = 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
            text = (
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    تم تسجيل غياب: <span className="text-red-700 dark:text-red-400">{log.details.studentName}</span>
                </p>
            );
            break;
        default:
            return null;
    }

    return (
        <li className="flex items-start">
            <div className={`${colorClasses} p-2 rounded-full mr-4 ml-2`}>
                {icon}
            </div>
            <div>
                {text}
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatTimeAgo(log.timestamp)}</p>
            </div>
        </li>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ students, teachers, halaqat, attendanceLogs, activityLogs }) => {
    
    const { 
        halaqaMemorizationData, 
        topStudents, 
        todayAttendanceRate, 
        attendanceTaken,
        weeklyAttendanceData,
        attendanceChange,
        attendanceChangeType
    } = useMemo(() => {
        // Calculate average memorization per halaqa
        const halaqaData: { [key: string]: { total: number, count: number } } = {};
        students.forEach(student => {
            if (!halaqaData[student.halaqaId]) {
                halaqaData[student.halaqaId] = { total: 0, count: 0 };
            }
            halaqaData[student.halaqaId].total += student.memorizationProgress;
            halaqaData[student.halaqaId].count++;
        });

        const halaqaMemorizationData = halaqat.map(h => ({
            name: h.name,
            'متوسط الحفظ': halaqaData[h.id] ? Math.round(halaqaData[h.id].total / halaqaData[h.id].count) : 0
        }));

        // Calculate top students
        const topStudentsData = students.map(student => ({
            ...student,
            score: student.memorizationProgress * 0.6 + student.attendanceRate * 0.4
        })).sort((a, b) => b.score - a.score).slice(0, 3);
        
        // --- Weekly and Daily Attendance Calculation ---

        // Group logs by date string (YYYY-MM-DD) and calculate totals
        const logsByDay: { [key: string]: { present: number; total: number } } = {};
        
        attendanceLogs.forEach(log => {
            const dateStr = new Date(log.date.seconds * 1000).toISOString().slice(0, 10);
            if (!logsByDay[dateStr]) {
                logsByDay[dateStr] = { present: 0, total: 0 };
            }
            const presentOrLateCount = Object.values(log.records).filter(status => status === 'present' || status === 'late').length;
            const totalRecords = Object.keys(log.records).length;
            logsByDay[dateStr].present += presentOrLateCount;
            logsByDay[dateStr].total += totalRecords;
        });

        // Calculate the attendance rate for each day that has logs
        const dailyRates: { [key: string]: number } = {};
        for (const dateStr in logsByDay) {
            const dayData = logsByDay[dateStr];
            dailyRates[dateStr] = dayData.total > 0 ? Math.round((dayData.present / dayData.total) * 100) : 0;
        }

        // Generate data for the last 7 days for the weekly chart
        const weeklyChartData = [];
        const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            
            weeklyChartData.push({
                name: dayNames[d.getDay()],
                'حضور': dailyRates[dateStr] || 0
            });
        }
        
        // Calculate today's attendance rate
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayRate = dailyRates[todayStr];
        const taken = todayRate !== undefined;
        
        // Calculate change from yesterday
        let change: string | null = null;
        let changeType: 'increase' | 'decrease' | null = null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        const yesterdayRate = dailyRates[yesterdayStr];
        
        if (taken && yesterdayRate !== undefined) {
            const diff = todayRate - yesterdayRate;
            if (diff !== 0) {
                change = `${Math.abs(diff)}%`;
                changeType = diff > 0 ? 'increase' : 'decrease';
            }
        }

        return { 
            halaqaMemorizationData, 
            topStudents: topStudentsData,
            todayAttendanceRate: taken ? todayRate : 0, 
            attendanceTaken: taken,
            weeklyAttendanceData: weeklyChartData,
            attendanceChange: change,
            attendanceChangeType: changeType,
        };
    }, [students, halaqat, attendanceLogs]);
    
    return (
        <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="مجموع الطلاب" 
                    value={students.length.toString()} 
                    icon={<UsersIcon className="text-green-800" />} 
                    color="green" 
                />
                <StatCard 
                    title="مجموع المعلمين" 
                    value={teachers.length.toString()} 
                    icon={<UsersIcon className="text-amber-600" />} 
                    color="amber" 
                />
                <StatCard 
                    title="مجموع الحلقات" 
                    value={halaqat.length.toString()}
                    icon={<BookOpenIcon className="text-blue-600" />} 
                    color="blue" 
                />
                <StatCard 
                    title="حضور اليوم" 
                    value={attendanceTaken ? `${todayAttendanceRate}%` : "لم يسجل"}
                    icon={<ClipboardListIcon className="text-red-600" />} 
                    color="red"
                    change={attendanceChange || undefined}
                    changeType={attendanceChangeType || undefined}
                    changeText="عن الأمس"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-3 space-y-8">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">أداء الحفظ حسب الحلقة</h3>
                         <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={halaqaMemorizationData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                                <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} tick={{ fontFamily: 'Cairo', fontSize: 11 }} className="text-gray-600 dark:text-gray-400" />
                                <YAxis unit="%" tick={{ fontFamily: 'Cairo' }} className="text-gray-600 dark:text-gray-400" />
                                <Tooltip wrapperStyle={{ fontFamily: 'Cairo' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                                <Bar dataKey="متوسط الحفظ" fill="#16A34A" barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">معدل الحضور الأسبوعي</h3>
                         <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={weeklyAttendanceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                                <XAxis dataKey="name" tick={{ fontFamily: 'Cairo' }} className="text-gray-600 dark:text-gray-400" />
                                <YAxis tick={{ fontFamily: 'Cairo' }} className="text-gray-600 dark:text-gray-400" unit="%" />
                                <Tooltip wrapperStyle={{ fontFamily: 'Cairo' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                                <Line type="monotone" dataKey="حضور" stroke="#2E7D32" strokeWidth={2} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Side Section: Top Students & Recent Activities */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <TrophyIcon className="h-6 w-6 text-amber-500"/>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">الطلاب الأوائل</h3>
                        </div>
                        <ul className="space-y-4">
                           {topStudents.map((student, index) => (
                               <li key={student.id} className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                   <span className={`text-lg font-bold w-6 text-center ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`}>#{index + 1}</span>
                                   <div className="flex-grow">
                                       <p className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">{halaqat.find(h => h.id === student.halaqaId)?.name}</p>
                                   </div>
                                   <div className="text-left">
                                      <p className="text-sm font-bold text-green-700 dark:text-green-400">{student.memorizationProgress}%</p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">حفظ</p>
                                   </div>
                               </li>
                           ))}
                        </ul>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">آخر الأنشطة</h3>
                        {activityLogs && activityLogs.length > 0 ? (
                            <ul className="space-y-4">
                                {activityLogs.map(log => <ActivityItem key={log.id} log={log} />)}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                <p>لا توجد أنشطة حديثة لعرضها.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
