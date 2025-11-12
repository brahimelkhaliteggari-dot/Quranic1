
import React, { useState, useEffect } from 'react';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { BellIcon } from './icons/BellIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <span className="text-green-700 dark:text-green-500">{icon}</span>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mr-3">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void }> = ({ enabled, setEnabled }) => (
    <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
    >
        <span className="sr-only">Enable dark mode</span>
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 flex items-center justify-center ${
                enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
        >
            {enabled ? <MoonIcon className="h-3 w-3 text-green-600" /> : <SunIcon className="h-3 w-3 text-gray-500" />}
        </span>
    </button>
);

interface SettingsProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDarkMode: boolean) => void;
    currentUser: { name: string; email: string; role: 'admin' | 'teacher' };
    onUpdateProfile: (profileData: { name: string; email: string; }) => Promise<void>;
    onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ isDarkMode, setIsDarkMode, currentUser, onUpdateProfile, onChangePassword }) => {
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [school, setSchool] = useState({ name: 'مدرسة الفرقان القرآنية', logo: '' });
    const [notifications, setNotifications] = useState({ summary: true, registration: true, achievement: false });
    
    // State for Profile
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    // State for Password
    const [passwords, setPasswords] = useState({ current: '', newPass: '', confirmPass: '' });
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    useEffect(() => {
        if(currentUser) {
            setProfile({ name: currentUser.name, email: currentUser.email });
        }
    }, [currentUser]);

    const handleSaveProfile = async () => {
        setProfileSuccess(false);
        setProfileError(null);
        setIsSavingProfile(true);
        try {
            await onUpdateProfile(profile);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (error: any) {
            setProfileError(error.message || "حدث خطأ غير متوقع.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSavePassword = async () => {
        setPasswordError(null);
        setPasswordSuccess(false);
        
        if (!passwords.current || !passwords.newPass || !passwords.confirmPass) {
            setPasswordError("الرجاء ملء جميع حقول كلمة المرور.");
            return;
        }

        if (passwords.newPass.length < 6) {
            setPasswordError("كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف.");
            return;
        }
    
        if (passwords.newPass !== passwords.confirmPass) {
            setPasswordError("كلمتا المرور الجديدتان غير متطابقتين.");
            return;
        }
    
        setIsSavingPassword(true);
        try {
            await onChangePassword(passwords.current, passwords.newPass);
            setPasswordSuccess(true);
            setPasswords({ current: '', newPass: '', confirmPass: '' });
            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            setPasswordError(error.message || "حدث خطأ غير متوقع.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">الإعدادات</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <SettingsCard title="الملف الشخصي" icon={<UserCircleIcon className="w-6 h-6" />}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                            <input type="text" id="name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني</label>
                            <input 
                                type="email" 
                                id="email" 
                                value={profile.email} 
                                onChange={e => setProfile({...profile, email: e.target.value})} 
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500"
                                disabled={currentUser.role === 'teacher'}
                            />
                             {currentUser.role === 'teacher' && <p className="text-xs text-gray-400 mt-1">لا يمكن تغيير البريد الإلكتروني للمعلم لحماية الحساب.</p>}
                        </div>
                        <div className="pt-4 flex justify-end items-center gap-4">
                            {profileSuccess && <p className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">تم الحفظ بنجاح!</p>}
                            <button 
                                onClick={handleSaveProfile} 
                                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={isSavingProfile}
                            >
                                {isSavingProfile ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                        {profileError && <p className="text-red-500 text-sm text-right mt-2">{profileError}</p>}
                    </div>
                </SettingsCard>

                {/* Password Settings */}
                <SettingsCard title="تغيير كلمة المرور" icon={<LockClosedIcon className="w-6 h-6" />}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الحالية</label>
                            <input type="password" id="currentPassword" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور الجديدة</label>
                            <input type="password" id="newPassword" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تأكيد كلمة المرور الجديدة</label>
                            <input type="password" id="confirmPassword" value={passwords.confirmPass} onChange={e => setPasswords({...passwords, confirmPass: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700 dark:text-white"/>
                        </div>
                        <div className="pt-4 flex justify-end items-center gap-4">
                            {passwordSuccess && <p className="text-sm text-green-600 dark:text-green-400 transition-opacity duration-300">تم تغيير كلمة المرور بنجاح!</p>}
                            <button 
                                onClick={handleSavePassword} 
                                className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                                disabled={isSavingPassword}
                            >
                                {isSavingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                            </button>
                        </div>
                         {passwordError && <p className="text-red-500 text-sm text-right mt-2">{passwordError}</p>}
                    </div>
                </SettingsCard>

                {/* Appearance */}
                <SettingsCard title="المظهر" icon={<SunIcon className="w-6 h-6 dark:text-amber-400"/>}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200">الوضع الداكن</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">قم بالتبديل بين الوضع الفاتح والداكن.</p>
                        </div>
                        <ToggleSwitch enabled={isDarkMode} setEnabled={setIsDarkMode} />
                    </div>
                </SettingsCard>

                {/* Notifications */}
                <SettingsCard title="الإشعارات" icon={<BellIcon className="w-6 h-6" />}>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">ملخص الحضور اليومي</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">استلم بريدًا إلكترونيًا يوميًا بملخص الحضور.</p>
                            </div>
                           <input type="checkbox" className="h-5 w-5 text-green-600 rounded-sm focus:ring-green-500 cursor-pointer border-gray-300 dark:bg-gray-900 dark:border-gray-600" checked={notifications.summary} onChange={e => setNotifications({...notifications, summary: e.target.checked})}/>
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">تسجيل طالب جديد</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">احصل على إشعار عند إضافة طالب جديد.</p>
                            </div>
                           <input type="checkbox" className="h-5 w-5 text-green-600 rounded-sm focus:ring-green-500 cursor-pointer border-gray-300 dark:bg-gray-900 dark:border-gray-600" checked={notifications.registration} onChange={e => setNotifications({...notifications, registration: e.target.checked})} />
                        </div>
                         <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">إنجازات الطلاب</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">احصل على إشعار عند إتمام طالب لسورة.</p>
                            </div>
                           <input type="checkbox" className="h-5 w-5 text-green-600 rounded-sm focus:ring-green-500 cursor-pointer border-gray-300 dark:bg-gray-900 dark:border-gray-600" checked={notifications.achievement} onChange={e => setNotifications({...notifications, achievement: e.target.checked})} />
                        </div>
                         <div className="pt-4 flex justify-end items-center gap-4">
                            <button disabled className="px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors disabled:bg-gray-400 cursor-not-allowed">حفظ التغييرات</button>
                        </div>
                    </div>
                </SettingsCard>
            </div>
        </div>
    );
};
