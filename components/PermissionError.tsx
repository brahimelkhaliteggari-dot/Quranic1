
import React, { useState, useCallback } from 'react';
import { LogoutIcon } from './icons/LogoutIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';
import { firebaseConfig } from '../firebase/config';

const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const FIRESTORE_RULES_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/rules`;

const SECURITY_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Default rule: Allow read/write access for any authenticated user.
    // This is a simple rule to get the app running.
    // match /{document=**} {
    //  allow read, write: if request.auth != null;
    // }

    // Recommended: More specific rules for better security
    match /students/{studentId} {
      allow read, write: if request.auth != null;
    }
    match /teachers/{teacherId} {
      allow read, write: if request.auth != null;
    }
    match /halaqat/{halaqaId} {
      allow read, write: if request.auth != null;
    }
    match /memorization_logs/{logId} {
      allow read, create: if request.auth != null;
    }
    match /daily_attendance/{docId} {
      allow read, write: if request.auth != null;
    }
    match /activity_logs/{logId} {
      allow read, create: if request.auth != null;
    }
  }
}`;

export const PermissionError: React.FC<{ onRetry: () => void; onLogout: () => void; }> = ({ onRetry, onLogout }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(SECURITY_RULES).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg m-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <ExclamationIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">خطوة إعداد أخيرة: تكوين صلاحيات الوصول</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        لتأمين بياناتك، يتطلب Firebase تكوين قواعد الأمان. يحتاج التطبيق إلى صلاحية للوصول إلى البيانات ليعمل بشكل صحيح.
                    </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border-r-4 border-green-500 p-4 rounded-md">
                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">الحل السريع (خطوتان)</h2>
                    <ol className="list-decimal list-inside my-2 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <li>
                            افتح صفحة قواعد الأمان في مشروعك على Firebase بالضغط على الرابط التالي.
                             <a 
                                href={FIRESTORE_RULES_URL} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block w-full text-center mt-2 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors font-semibold"
                            >
                                الانتقال إلى صفحة قواعد Firebase
                            </a>
                        </li>
                        <li>
                            احذف القواعد الحالية، ثم انسخ الكود أدناه والصقه في المحرر.
                        </li>
                    </ol>
                </div>

                <div className="relative">
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-xs text-left overflow-x-auto" dir="ltr">
                        <code>{SECURITY_RULES}</code>
                    </pre>
                    <button 
                        onClick={handleCopy}
                        className="absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        {isCopied ? 'تم النسخ!' : 'نسخ الكود'}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                    بعد لصق الكود، اضغط على زر <strong className="text-gray-700 dark:text-gray-200">Publish</strong> لحفظ التغييرات، ثم عد إلى هنا واضغط على "إعادة المحاولة".
                </p>

                <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 group relative w-full justify-center py-2 px-4 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        تسجيل الخروج
                    </button>
                     <button
                        onClick={onRetry}
                        className="flex items-center gap-2 group relative w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <RefreshIcon className="h-5 w-5" />
                        إعادة المحاولة
                    </button>
                </div>
            </div>
        </div>
    );
};
