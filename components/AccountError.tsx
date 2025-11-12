
import React from 'react';
import { LogoutIcon } from './icons/LogoutIcon';
import { ExclamationIcon } from './icons/ExclamationIcon';

interface AccountErrorProps {
    message: string;
    onLogout: () => void;
}

export const AccountError: React.FC<AccountErrorProps> = ({ message, onLogout }) => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg m-4">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                        <ExclamationIcon className="h-6 w-6 text-red-600" />
                    </div>
                    <h1 className="mt-4 text-2xl font-bold text-gray-800 dark:text-gray-100">مشكلة في الحساب</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                <div className="pt-4 text-center">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 group relative justify-center py-2 px-6 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 mx-auto"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        تسجيل الخروج
                    </button>
                </div>
            </div>
        </div>
    );
};
