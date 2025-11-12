
import React, { useMemo } from 'react';
import type { Parent, Student, Halaqa } from '../types';
import { CircularProgress } from './CircularProgress';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';

interface ParentDashboardProps {
  parent: Parent;
  students: Student[];
  halaqat: Halaqa[];
}

const ChildInfoCard: React.FC<{ student: Student; halaqaName: string }> = ({ student, halaqaName }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-r-4 border-green-700 dark:border-green-600">
        <div className="flex items-start justify-between">
            <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{student.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <BookOpenIcon className="w-4 h-4" />
                    <span>{halaqaName}</span>
                </div>
            </div>
            <img 
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                src={`https://i.pravatar.cc/60?u=${student.id}`} 
                alt={student.name} 
            />
        </div>
        <div className="mt-4 flex items-center justify-around gap-4">
            <div className="text-center">
                <CircularProgress progress={student.memorizationProgress} color="#16A34A" size={90} strokeWidth={7} />
                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">تقدم الحفظ</p>
            </div>
            <div className="text-center">
                <CircularProgress progress={student.attendanceRate} color="#F59E0B" size={90} strokeWidth={7} />
                <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300">معدل الحضور</p>
            </div>
        </div>
    </div>
);


export const ParentDashboard: React.FC<ParentDashboardProps> = ({ parent, students, halaqat }) => {

    const myChildren = useMemo(() => {
        return students.filter(s => s.parentId === parent.id);
    }, [parent.id, students]);

    const getHalaqaName = (halaqaId: string) => halaqat.find(h => h.id === halaqaId)?.name || 'غير محدد';

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">أهلاً بك، {parent.name}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">هنا يمكنك متابعة تقدم أبنائك في حلقات القرآن الكريم.</p>
            
            {myChildren.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myChildren.map(child => (
                        <ChildInfoCard 
                            key={child.id}
                            student={child}
                            halaqaName={getHalaqaName(child.halaqaId)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <UsersIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-200">لم يتم ربط أي من أبنائك بحسابك بعد.</h3>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">يرجى التواصل مع إدارة المدرسة لربط الطلاب بحسابك.</p>
                </div>
            )}
        </div>
    );
};
