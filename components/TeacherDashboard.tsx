import React, { useMemo } from 'react';
import type { Teacher, Student, Halaqa } from '../types';
import { StatCard } from './StatCard';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TeacherDashboardProps {
  teacher: Teacher;
  students: Student[];
  halaqat: Halaqa[];
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ teacher, students, halaqat }) => {

    const {
        halaqaCount,
        studentCount,
        avgMemorization,
        avgAttendance,
        halaqaMemorizationData,
        topStudents,
        studentsNeedingAttention
    } = useMemo(() => {
        const assignedHalaqat = halaqat.filter(h => h.teacherId === teacher.id);
        const assignedStudents = students.filter(s => s.teacherId === teacher.id);

        const halaqaCount = assignedHalaqat.length;
        const studentCount = assignedStudents.length;

        if (studentCount === 0) {
            return {
                halaqaCount, studentCount, avgMemorization: 0, avgAttendance: 0,
                halaqaMemorizationData: [], topStudents: [], studentsNeedingAttention: []
            };
        }

        const totalMemorization = assignedStudents.reduce((acc, s) => acc + s.memorizationProgress, 0);
        const avgMemorization = Math.round(totalMemorization / studentCount);
        
        const totalAttendance = assignedStudents.reduce((acc, s) => acc + s.attendanceRate, 0);
        const avgAttendance = Math.round(totalAttendance / studentCount);

        const halaqaMemorizationData = assignedHalaqat.map(halaqa => {
            const studentsInHalaqa = assignedStudents.filter(s => s.halaqaId === halaqa.id);
            if (studentsInHalaqa.length === 0) return { name: halaqa.name, 'متوسط الحفظ': 0 };
            const totalMemo = studentsInHalaqa.reduce((acc, s) => acc + s.memorizationProgress, 0);
            return { name: halaqa.name, 'متوسط الحفظ': Math.round(totalMemo / studentsInHalaqa.length) };
        });

        const topStudents = [...assignedStudents]
            .sort((a, b) => b.memorizationProgress - a.memorizationProgress)
            .slice(0, 3);

        const studentsNeedingAttention = assignedStudents
            .filter(s => s.memorizationProgress < 70 || s.attendanceRate < 90)
            .sort((a,b) => a.memorizationProgress - b.memorizationProgress)
            .slice(0, 3);

        return { halaqaCount, studentCount, avgMemorization, avgAttendance, halaqaMemorizationData, topStudents, studentsNeedingAttention };
    }, [teacher.id, students, halaqat]);
    
    if (studentCount === 0) {
         return (
             <div className="text-center py-16">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">أهلاً بك، {teacher.name}</h2>
                <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">لم يتم إسناد أي طلاب أو حلقات لك بعد.</p>
                <p className="text-gray-400 dark:text-gray-500">يرجى مراجعة مدير النظام.</p>
            </div>
         )
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">أهلاً بك، {teacher.name}</h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="الحلقات المسندة" 
                    value={halaqaCount.toString()}
                    icon={<BookOpenIcon className="text-green-800" />} 
                    color="green" 
                />
                <StatCard 
                    title="إجمالي الطلاب" 
                    value={studentCount.toString()}
                    icon={<UsersIcon className="text-amber-600" />} 
                    color="amber" 
                />
                 <StatCard 
                    title="متوسط الحفظ" 
                    value={`${avgMemorization}%`}
                    icon={<ChartBarIcon className="text-blue-600" />} 
                    color="blue" 
                />
                 <StatCard 
                    title="متوسط الحضور" 
                    value={`${avgAttendance}%`}
                    icon={<ClipboardListIcon className="text-red-600" />} 
                    color="red"
                />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-8">
                     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">أداء الحفظ في حلقاتك</h3>
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
                </div>

                {/* Side Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex items-center gap-3 mb-4">
                            <TrophyIcon className="h-6 w-6 text-amber-500"/>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">الطلاب الأوائل</h3>
                        </div>
                        <ul className="space-y-4">
                           {topStudents.map((student, index) => (
                               <li key={student.id} className="flex items-center gap-4 p-2 rounded-md transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                   <span className={`text-lg font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`}>#{index + 1}</span>
                                   <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${student.id}`} alt={student.name} />
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
                    
                    {studentsNeedingAttention.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <ExclamationIcon className="h-6 w-6 text-red-500"/>
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">طلاب بحاجة لمتابعة</h3>
                            </div>
                            <ul className="space-y-4">
                            {studentsNeedingAttention.map((student) => (
                                <li key={student.id} className="flex items-center gap-4 p-2 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 border-r-2 border-red-500">
                                    <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/40?u=${student.id}`} alt={student.name} />
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{halaqat.find(h => h.id === student.halaqaId)?.name}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-bold ${student.memorizationProgress < 70 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'}`}>{student.memorizationProgress}% حفظ</p>
                                        <p className={`text-xs ${student.attendanceRate < 90 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>{student.attendanceRate}% حضور</p>
                                    </div>
                                </li>
                            ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
