
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Students } from './components/Students';
import { Teachers } from './components/Teachers';
import { Halaqat } from './components/Halaqat';
import { Attendance } from './components/Attendance';
import { Memorization } from './components/Memorization';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { TeacherDashboard } from './components/TeacherDashboard';
import { PermissionError } from './components/PermissionError';
import { AccountError } from './components/AccountError';
import type { Page, Teacher, Student, Halaqa, AttendanceLog, ActivityLog } from './types';
import { db, auth, firebaseConfig } from './firebase/config';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc, getDoc, writeBatch, Timestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, createUserWithEmailAndPassword, getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';


const ADMIN_EMAIL = 'admin123@quran.system';
const mockAdminInfo = { 
  id: 'admin01',
  name: 'عبدالله الأحمد', 
  email: ADMIN_EMAIL, 
  role: 'admin' as const, 
};

type AppUser = typeof mockAdminInfo | (Teacher & { role: 'teacher' });

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('isDarkMode');
    if (savedMode) {
      return savedMode === 'true';
    }
    // Default to dark mode if user's system prefers it
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [halaqat, setHalaqat] = useState<Halaqa[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);


  const handleLogout = async () => {
    try {
        await signOut(auth);
        setCurrentUser(null);
        setCurrentPage('dashboard');
        setAccountError(null);
        setStudents([]);
        setTeachers([]);
        setHalaqat([]);
    } catch (error) {
        console.error("Logout failed:", error);
        alert("فشل تسجيل الخروج.");
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setDataLoading(true);
      setPermissionError(false);
      
      const teachersSnapshot = await getDocs(collection(db, 'teachers'));
      const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Teacher[];
      
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsData = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];

      const halaqatSnapshot = await getDocs(collection(db, 'halaqat'));
      const halaqatData = halaqatSnapshot.docs.map(doc => {
          const halaqa = { id: doc.id, ...doc.data() } as Omit<Halaqa, 'studentCount'>;
          const studentCount = studentsData.filter(s => s.halaqaId === halaqa.id).length;
          return { ...halaqa, studentCount };
      }) as Halaqa[];
      
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(todayEnd.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const attendanceQuery = query(
          collection(db, "daily_attendance"), 
          where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
          where("date", "<=", Timestamp.fromDate(todayEnd))
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceLog[];
      setAttendanceLogs(attendanceData);

      const activityQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(5));
      const activitySnapshot = await getDocs(activityQuery);
      const activityData = activitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setActivityLogs(activityData);
      
      setTeachers(teachersData);
      setStudents(studentsData);
      setHalaqat(halaqatData);

    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.code === 'permission-denied' || error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        setPermissionError(true);
      }
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleRetryFetch = () => {
    setPermissionError(false);
    fetchData();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        setAccountError(null);
        if (user) {
            if (user.email === ADMIN_EMAIL) {
                const savedAdminProfile = localStorage.getItem('adminProfile');
                if (savedAdminProfile) {
                    setCurrentUser({ ...mockAdminInfo, ...JSON.parse(savedAdminProfile) });
                } else {
                    setCurrentUser(mockAdminInfo);
                }
                await fetchData();
            } else {
                const teacherRef = doc(db, "teachers", user.uid);
                const teacherSnap = await getDoc(teacherRef);

                if (teacherSnap.exists()) {
                    setCurrentUser({
                        id: teacherSnap.id,
                        ...(teacherSnap.data() as Omit<Teacher, 'id'>),
                        role: 'teacher',
                    });
                    await fetchData();
                } else {
                    console.error("Authenticated user is not an admin or teacher. UID:", user.uid);
                    setAccountError(`الحساب (${user.email}) غير مسجل في النظام. يرجى التأكد من استخدام البريد الإلكتروني الصحيح أو التواصل مع مدير النظام.`);
                }
            }
        } else {
            setCurrentUser(null);
        }
        setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [fetchData]);

  useEffect(() => {
    if (currentUser?.role === 'teacher') {
      const allowedTeacherPages: Page[] = ['dashboard', 'students', 'halaqat', 'attendance', 'memorization', 'settings'];
      if (!allowedTeacherPages.includes(currentPage)) {
        setCurrentPage('dashboard');
      }
    }
  }, [currentPage, currentUser]);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('isDarkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('isDarkMode', 'false');
    }
  }, [isDarkMode]);

  const handleLogin = async (email, password) => {
      try {
          await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
          console.error("Login failed:", error);
          throw error;
      }
  };

  
  // --- CRUD Operations ---
  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'attendanceRate' | 'teacherId'>, id?: string) => {
      const halaqa = halaqat.find(h => h.id === studentData.halaqaId);
      if (!halaqa) {
          console.error("Cannot save student, halaqa not found");
          return;
      }
      const dataToSave = { ...studentData, teacherId: halaqa.teacherId };

      try {
          if (id) {
              await updateDoc(doc(db, 'students', id), dataToSave);
          } else {
              await addDoc(collection(db, 'students'), { ...dataToSave, attendanceRate: 100 });
              // Create activity log for new student
              await addDoc(collection(db, 'activity_logs'), {
                  type: 'new_student',
                  timestamp: Timestamp.now(),
                  details: {
                      studentName: dataToSave.name,
                      halaqaName: halaqa.name,
                  }
              });
          }
          fetchData();
      } catch (error) {
          console.error("Error saving student:", error);
      }
  };

  const handleDeleteStudent = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'students', id));
          fetchData();
      } catch (error) {
          console.error("Error deleting student:", error);
      }
  };
  
  const handleSaveTeacher = async (teacherData: Omit<Teacher, 'id'>, id?: string) => {
      if (id) {
          try {
              const teacherRef = doc(db, 'teachers', id);
              const { password, ...dataToUpdate } = teacherData;
              await updateDoc(teacherRef, dataToUpdate);
              await fetchData();
          } catch (error) {
              console.error("Error updating teacher:", error);
              throw new Error("فشل تحديث بيانات المعلم.");
          }
      } else {
          if (!teacherData.password || teacherData.password.length < 6) {
              throw new Error("كلمة المرور مطلوبة ويجب أن لا تقل عن 6 أحرف.");
          }

          let secondaryApp;
          try {
              secondaryApp = initializeApp(firebaseConfig, `secondary-auth-${Date.now()}`);
              const secondaryAuth = getAuth(secondaryApp);
              const userCredential = await createUserWithEmailAndPassword(secondaryAuth, teacherData.email, teacherData.password);
              const { password, ...teacherDocData } = teacherData;
              await setDoc(doc(db, "teachers", userCredential.user.uid), teacherDocData);
              await fetchData();
          } catch (error: any) {
              console.error("Error creating teacher:", error);
              if (error.code === 'auth/email-already-in-use') {
                  throw new Error("هذا البريد الإلكتروني مسجل بالفعل.");
              }
              throw new Error("فشل إنشاء حساب المعلم.");
          } finally {
              if (secondaryApp) await deleteApp(secondaryApp);
          }
      }
  };

  const handleDeleteTeacher = async (id: string) => {
      try {
          console.warn(`DELETING TEACHER FROM FIRESTORE. IMPORTANT: You must manually delete the user from Firebase Authentication.`);
          await deleteDoc(doc(db, 'teachers', id));
          fetchData();
      } catch (error) {
          console.error("Error deleting teacher:", error);
      }
  };

  const handleSaveHalaqa = async (halaqaData: Omit<Halaqa, 'id' | 'studentCount'>, id?: string) => {
      try {
          if (id) {
              const halaqaRef = doc(db, 'halaqat', id);
              const originalHalaqaSnap = await getDoc(halaqaRef);
              const oldTeacherId = originalHalaqaSnap.data()?.teacherId;
              const newTeacherId = halaqaData.teacherId;

              if (oldTeacherId && oldTeacherId !== newTeacherId) {
                  const batch = writeBatch(db);
                  batch.update(halaqaRef, halaqaData);
                  const studentsQuery = query(collection(db, 'students'), where('halaqaId', '==', id));
                  const studentsSnapshot = await getDocs(studentsQuery);
                  studentsSnapshot.forEach(studentDoc => {
                      batch.update(studentDoc.ref, { teacherId: newTeacherId });
                  });
                  await batch.commit();
              } else {
                  await updateDoc(halaqaRef, halaqaData);
              }
          } else {
              await addDoc(collection(db, 'halaqat'), halaqaData);
          }
          fetchData();
      } catch (error) {
          console.error("Error saving halaqa:", error);
      }
  };

  const handleDeleteHalaqa = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'halaqat', id));
          fetchData();
      } catch (error) {
          console.error("Error deleting halaqa:", error);
      }
  };

  const handleSaveAttendance = async (records: Record<string, 'present' | 'absent' | 'late'>, halaqaId: string, teacherId: string) => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const docId = `${halaqaId}_${todayStr}`;
    
    try {
        const batch = writeBatch(db);
        const docRef = doc(db, "daily_attendance", docId);
        batch.set(docRef, {
            date: Timestamp.now(),
            halaqaId,
            teacherId,
            records
        });

        // Add activity logs for absences
        const halaqa = halaqat.find(h => h.id === halaqaId);
        for (const studentId in records) {
            if (records[studentId] === 'absent') {
                const student = students.find(s => s.id === studentId);
                if (student && halaqa) {
                    const activityLogRef = doc(collection(db, 'activity_logs'));
                    batch.set(activityLogRef, {
                        type: 'absence_log',
                        timestamp: Timestamp.now(),
                        details: {
                            studentName: student.name,
                            halaqaName: halaqa.name,
                        }
                    });
                }
            }
        }

        await batch.commit();
        await fetchData(); 
    } catch (error: any) {
        console.error("Error saving attendance:", error);
        if (error.code === 'permission-denied' || error.message.includes('permission-denied')) {
             throw new Error("permission-denied");
        }
        throw error;
    }
  };
  
  const handleSaveMemorizationLogs = async (records, halaqaId, teacherId) => {
      const batch = writeBatch(db);
      const logsCollectionRef = collection(db, "memorization_logs");
      const activityLogsCollectionRef = collection(db, "activity_logs");
      const halaqa = halaqat.find(h => h.id === halaqaId);

      for (const studentId in records) {
          const record = records[studentId];
          if (record.newMemorization.surah && record.newMemorization.from && record.newMemorization.to) {
              const student = students.find(s => s.id === studentId);
              
              // Add memorization log
              const newLogRef = doc(logsCollectionRef);
              batch.set(newLogRef, {
                  studentId,
                  halaqaId,
                  teacherId,
                  date: Timestamp.now(),
                  surah: record.newMemorization.surah,
                  fromVerse: Number(record.newMemorization.from),
                  toVerse: Number(record.newMemorization.to),
                  quality: record.quality,
                  notes: record.notes,
              });

              // Add activity log for the memorization
              if (student && halaqa) {
                 const newActivityLogRef = doc(activityLogsCollectionRef);
                 batch.set(newActivityLogRef, {
                    type: 'memorization_log',
                    timestamp: Timestamp.now(),
                    details: {
                        studentName: student.name,
                        halaqaName: halaqa.name,
                        surah: record.newMemorization.surah,
                    }
                 });
              }
          }
      }

      try {
          await batch.commit();
          await fetchData(); // Refresh data to show new activity logs
      } catch (error) {
          console.error("Error saving memorization logs:", error);
          throw error;
      }
  };

    const handleUpdateProfile = async (profileData: { name: string; email: string; }) => {
        if (!currentUser) return;
        
        if (currentUser.role === 'admin') {
            const updatedAdmin = { ...currentUser, ...profileData };
            setCurrentUser(updatedAdmin);
            localStorage.setItem('adminProfile', JSON.stringify({ name: updatedAdmin.name, email: updatedAdmin.email }));
            return;
        }

        if (currentUser.role === 'teacher') {
            try {
                const teacherRef = doc(db, 'teachers', currentUser.id);
                await updateDoc(teacherRef, { name: profileData.name });
                
                // Update state locally for faster UI response
                setCurrentUser(prevUser => {
                    if (!prevUser || prevUser.role !== 'teacher') return prevUser;
                    return { ...prevUser, name: profileData.name };
                });
                setTeachers(prevTeachers => prevTeachers.map(t => 
                    t.id === currentUser.id ? { ...t, name: profileData.name } : t
                ));

            } catch (error) {
                console.error("Error updating profile:", error);
                throw new Error("فشل تحديث الملف الشخصي.");
            }
        }
    };

    const handleChangePassword = async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error("لا يوجد مستخدم مسجل للدخول.");
        }
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
        } catch (error: any) {
            console.error("Password change failed:", error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error("كلمة المرور الحالية غير صحيحة.");
            } else if (error.code === 'auth/weak-password') {
                throw new Error("كلمة المرور الجديدة ضعيفة جداً.");
            }
            throw new Error("فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.");
        }
    };

  if (authLoading || (currentUser && dataLoading)) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
              <div className="text-center">
                  <h1 className="text-3xl font-bold text-green-800 dark:text-amber-500 mb-4">نظام قرآني</h1>
                  <p className="text-gray-600 dark:text-gray-400">...جاري التحميل</p>
              </div>
          </div>
      );
  }

  if (permissionError) {
    return <PermissionError onRetry={handleRetryFetch} onLogout={handleLogout} />;
  }

  if (accountError) {
      return <AccountError message={accountError} onLogout={handleLogout} />;
  }

  if (!currentUser) {
      return <Login onLogin={handleLogin} />;
  }
  
  const pageTitleMap: { [key in Page]: string } = {
    dashboard: 'الرئيسية',
    students: currentUser.role === 'admin' ? 'إدارة الطلاب' : 'طلابي',
    teachers: 'إدارة المعلمين',
    halaqat: currentUser.role === 'admin' ? 'إدارة الحلقات' : 'حلقاتي',
    attendance: 'تسجيل الحضور والغياب',
    memorization: 'متابعة الحفظ والتسميع',
    reports: 'التقارير والإحصائيات',
    settings: 'الإعدادات',
    parents: 'إدارة أولياء الأمور',
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900" dir="rtl">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={pageTitleMap[currentPage]} 
          onMenuClick={() => setSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {currentUser.role === 'admin' && currentPage === 'dashboard' && <Dashboard students={students} teachers={teachers} halaqat={halaqat} attendanceLogs={attendanceLogs} activityLogs={activityLogs} />}
          {currentUser.role === 'teacher' && currentPage === 'dashboard' && <TeacherDashboard teacher={currentUser} students={students} halaqat={halaqat} />}
          
          {currentPage === 'students' && (currentUser.role === 'admin' 
              ? <Students students={students} halaqat={halaqat} teachers={teachers} onSave={handleSaveStudent} onDelete={handleDeleteStudent} attendanceLogs={attendanceLogs} /> 
              : <Students students={students} halaqat={halaqat} teachers={teachers} onSave={handleSaveStudent} onDelete={handleDeleteStudent} teacherId={currentUser.id} attendanceLogs={attendanceLogs} />
          )}
          {currentPage === 'teachers' && currentUser.role === 'admin' && <Teachers teachers={teachers} halaqat={halaqat} students={students} onSave={handleSaveTeacher} onDelete={handleDeleteTeacher} />}
          
          {currentPage === 'halaqat' && (currentUser.role === 'admin'
              ? <Halaqat halaqat={halaqat} teachers={teachers} onSave={handleSaveHalaqa} onDelete={handleDeleteHalaqa} />
              : <Halaqat halaqat={halaqat} teachers={teachers} onSave={handleSaveHalaqa} onDelete={handleDeleteHalaqa} teacherId={currentUser.id} />
          )}

          {currentPage === 'attendance' && <Attendance students={students} halaqat={halaqat} onSave={handleSaveAttendance} attendanceLogs={attendanceLogs} teacherId={currentUser.role === 'teacher' ? currentUser.id : undefined} />}
          {currentPage === 'memorization' && <Memorization students={students} halaqat={halaqat} onSave={handleSaveMemorizationLogs} teacherId={currentUser.role === 'teacher' ? currentUser.id : undefined} />}
          
          {currentPage === 'reports' && currentUser.role === 'admin' && <Reports students={students} teachers={teachers} halaqat={halaqat} />}
          {currentPage === 'settings' && <Settings 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode}
              currentUser={currentUser}
              onUpdateProfile={handleUpdateProfile}
              onChangePassword={handleChangePassword}
            />}
        </main>
      </div>
    </div>
  );
};

export default App;
