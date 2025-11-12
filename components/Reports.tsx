import React, { useState, useMemo, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Student, Halaqa, Teacher } from '../types';
import { PdfIcon } from './icons/PdfIcon';

// Add a global declaration for the html2pdf library
declare global {
  interface Window {
    html2pdf: any;
  }
}

// Promise-based script loader for html2pdf to prevent race conditions and duplicate loading.
const HTML2PDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
let scriptLoadingPromise: Promise<void> | null = null;

const loadHtml2PdfScript = (): Promise<void> => {
    // If script is already available, resolve immediately.
    if (window.html2pdf) {
        return Promise.resolve();
    }
    // If script is already loading, return the existing promise.
    if (scriptLoadingPromise) {
        return scriptLoadingPromise;
    }
    // Otherwise, create a new promise to load the script.
    scriptLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = HTML2PDF_URL;
        script.async = true;
        
        script.onload = () => {
            resolve();
        };
        
        script.onerror = () => {
            scriptLoadingPromise = null; // Reset for retry on failure
            reject(new Error('فشل تحميل مكتبة PDF. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'));
        };

        document.body.appendChild(script);
    });

    return scriptLoadingPromise;
};

interface ReportsProps {
    students: Student[];
    teachers: Teacher[];
    halaqat: Halaqa[];
}

const COLORS = ['#16A34A', '#F59E0B', '#EF4444']; // Green, Amber, Red

const StatCard: React.FC<{ title: string, value: string, description?: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-r-4 border-green-700 dark:border-green-600">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{description}</p>}
    </div>
);

export const Reports: React.FC<ReportsProps> = ({ students, teachers, halaqat }) => {
    const [selectedHalaqa, setSelectedHalaqa] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const reportContentRef = useRef<HTMLDivElement>(null);

    const filteredStudents = useMemo(() => {
        if (!selectedHalaqa) return students;
        return students.filter(s => s.halaqaId === selectedHalaqa);
    }, [selectedHalaqa, students]);

    const {
        avgMemorization,
        avgAttendance,
        studentPerformanceDist
    } = useMemo(() => {
        const studentsToAnalyze = filteredStudents;
        
        const totalMemorization = studentsToAnalyze.reduce((acc, s) => acc + (Number(s.memorizationProgress) || 0), 0);
        const avgMemorizationValue = studentsToAnalyze.length > 0 ? (totalMemorization / studentsToAnalyze.length).toFixed(1) : '0.0';
        
        const totalAttendance = studentsToAnalyze.reduce((acc, s) => acc + (Number(s.attendanceRate) || 0), 0);
        const avgAttendanceValue = studentsToAnalyze.length > 0 ? (totalAttendance / studentsToAnalyze.length).toFixed(1) : '0.0';

        const distribution = { excellent: 0, good: 0, repeat: 0 };
        studentsToAnalyze.forEach(s => {
            if (s.memorizationProgress >= 90) distribution.excellent++;
            else if (s.memorizationProgress >= 70) distribution.good++;
            else distribution.repeat++;
        });
        const studentPerformanceDistData = [
            { name: 'ممتاز (90% فأكثر)', value: distribution.excellent },
            { name: 'جيد (70%-89%)', value: distribution.good },
            { name: 'يحتاج لمتابعة (أقل من 70%)', value: distribution.repeat }
        ];

        return { 
            avgMemorization: avgMemorizationValue, 
            avgAttendance: avgAttendanceValue, 
            studentPerformanceDist: studentPerformanceDistData,
        };
    }, [filteredStudents]);

    const {
        halaqaPerformance,
        topHalaqa,
    } = useMemo(() => {
        const halaqaData: { [key: string]: { total: number, count: number } } = {};
        students.forEach(student => {
            if (!halaqaData[student.halaqaId]) {
                halaqaData[student.halaqaId] = { total: 0, count: 0 };
            }
            halaqaData[student.halaqaId].total += (Number(student.memorizationProgress) || 0);
            halaqaData[student.halaqaId].count++;
        });

        const halaqaPerformanceData = halaqat.map(h => ({
            name: h.name,
            'متوسط الحفظ': halaqaData[h.id] ? (halaqaData[h.id].total / halaqaData[h.id].count) : 0
        }));
        
        const topHalaqaData = halaqaPerformanceData.length > 0 
            ? halaqaPerformanceData.reduce((prev, current) => (current['متوسط الحفظ'] > prev['متوسط الحفظ']) ? current : prev)
            : { name: 'N/A', 'متوسط الحفظ': 0 };

        return { 
            halaqaPerformance: halaqaPerformanceData, 
            topHalaqa: topHalaqaData,
        };
    }, [students, halaqat]);
    
    const handleExportPDF = () => {
        if (isExporting) {
            return;
        }

        setIsExporting(true);

        // Defer the execution to allow React to re-render with animations disabled.
        setTimeout(() => {
            const execute = async () => {
                try {
                    await loadHtml2PdfScript();

                    const element = reportContentRef.current;
                    if (!element) {
                        throw new Error('لم يتم العثور على محتوى التقرير.');
                    }

                    const options = {
                        margin: 0.5,
                        filename: `quran_school_report_${new Date().toISOString().slice(0, 10)}.pdf`,
                        image: { type: 'jpeg', quality: 0.98 },
                        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                    };

                    await window.html2pdf().from(element).set(options).save();

                } catch (error) {
                    console.error("PDF export failed:", error);
                    const errorMessage = error instanceof Error ? error.message : 'فشل تصدير PDF. يرجى المحاولة مرة أخرى.';
                    alert(errorMessage);
                } finally {
                    setIsExporting(false);
                }
            };
            execute();
        }, 50); // A small delay for the render cycle to complete.
    };

    const getHalaqaName = (halaqaId: string) => halaqat.find(h => h.id === halaqaId)?.name || 'N/A';
    const getTeacherName = (teacherId: string) => teachers.find(t => t.id === teacherId)?.name || 'N/A';

    return (
        <div className="space-y-8">
            {/* Header and Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md gap-4 print:hidden">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">تقارير الأداء</h2>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <select
                        value={selectedHalaqa}
                        onChange={(e) => setSelectedHalaqa(e.target.value)}
                        className="w-full md:w-60 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">جميع الحلقات</option>
                        {halaqat.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleExportPDF} 
                        disabled={isExporting}
                        className="flex items-center gap-2 bg-red-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-800 transition-colors disabled:bg-red-400 disabled:cursor-wait"
                    >
                        <PdfIcon className="w-5 h-5" />
                        {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
                    </button>
                </div>
            </div>

            {/* Content to be exported to PDF */}
            <div id="report-content" ref={reportContentRef} className="dark:print:bg-gray-800">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard title="متوسط الحفظ" value={`${avgMemorization}%`} description={selectedHalaqa ? `في حلقة ${getHalaqaName(selectedHalaqa)}` : "لجميع الطلاب"} />
                    <StatCard title="متوسط الحضور" value={`${avgAttendance}%`} description={selectedHalaqa ? `في حلقة ${getHalaqaName(selectedHalaqa)}` : "لجميع الطلاب"} />
                    <StatCard title="الحلقة الأعلى أداءً" value={topHalaqa?.name || 'N/A'} description={`بمتوسط حفظ ${topHalaqa['متوسط الحفظ']?.toFixed(1)}%`} />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">مقارنة أداء الحلقات (متوسط الحفظ)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={halaqaPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
                                <XAxis dataKey="name" angle={-20} textAnchor="end" height={60} tick={{ fontFamily: 'Cairo', fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                                <YAxis unit="%" tick={{ fontFamily: 'Cairo' }} className="text-gray-600 dark:text-gray-400" />
                                <Tooltip wrapperStyle={{ fontFamily: 'Cairo' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                                <Legend wrapperStyle={{ fontFamily: 'Cairo' }} />
                                <Bar dataKey="متوسط الحفظ" fill="#2E7D32" barSize={30} isAnimationActive={!isExporting} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">توزيع مستوى الطلاب</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    isAnimationActive={!isExporting}
                                    data={studentPerformanceDist}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {studentPerformanceDist.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip wrapperStyle={{ fontFamily: 'Cairo' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#000', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                                <Legend wrapperStyle={{ fontFamily: 'Cairo' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Student Table */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">تقرير الطلاب التفصيلي</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <thead className="bg-green-50 dark:bg-gray-700">
                                <tr>
                                    <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">اسم الطالب</th>
                                    <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">الحلقة</th>
                                    <th className="text-right font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">المعلم</th>
                                    <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">نسبة الحفظ</th>
                                    <th className="text-center font-semibold text-gray-600 dark:text-gray-300 px-4 py-3">نسبة الحضور</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{student.name}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{getHalaqaName(student.halaqaId)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{getTeacherName(student.teacherId)}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{student.memorizationProgress}%</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center">{student.attendanceRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};