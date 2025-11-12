
import React, { useState } from 'react';
import { LoginIcon } from './icons/LoginIcon';

interface LoginProps {
    onLogin: (email: string, password: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('admin123@quran.system');
    const [password, setPassword] = useState('password');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError(null);
        try {
            await onLogin(email, password);
        } catch (err: any) {
            if (err.code === 'auth/invalid-credential') {
                if (email === 'admin123@quran.system') {
                    setError('بيانات دخول المدير غير صحيحة. تأكد من وجود حساب المدير (admin123@quran.system) في لوحة تحكم Firebase Authentication بكلمة المرور الصحيحة.');
                } else {
                    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
                }
            } else {
                setError('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg m-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-green-800 dark:text-amber-500">نظام قرآني</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">مرحباً بك مجدداً! الرجاء تسجيل الدخول للمتابعة.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">البريد الإلكتروني</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50 dark:bg-gray-700"
                                placeholder="البريد الإلكتروني"
                                disabled={isLoggingIn}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">كلمة المرور</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError(null);
                                }}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm bg-gray-50 dark:bg-gray-700"
                                placeholder="كلمة المرور"
                                disabled={isLoggingIn}
                            />
                        </div>
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border-r-4 border-red-500 rounded-md">
                            <p className="text-sm text-center text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:bg-green-500 disabled:cursor-not-allowed"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <LoginIcon className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                            </span>
                            {isLoggingIn ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
