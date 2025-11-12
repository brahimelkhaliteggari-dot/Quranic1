import React from 'react';
import type { Page, Teacher } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CogIcon } from './icons/CogIcon';
import { LogoutIcon } from './icons/LogoutIcon';

type User = (Teacher & { role: 'teacher' }) | { name: string; email: string; role: 'admin' };

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  currentUser: User;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <li
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors duration-200 ${
        isActive
          ? 'bg-amber-500 text-green-900 font-bold shadow-md dark:bg-amber-600 dark:text-gray-900'
          : 'text-white dark:text-gray-300 hover:bg-green-700 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      <span className="w-6 h-6">{icon}</span>
      <span className="mr-4">{label}</span>
    </li>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isSidebarOpen, setSidebarOpen, onLogout, currentUser }) => {
    
    const adminNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', label: 'الرئيسية', icon: <HomeIcon /> },
        { page: 'students', label: 'الطلاب', icon: <UsersIcon /> },
        { page: 'teachers', label: 'المعلمون', icon: <UsersIcon /> },
        { page: 'halaqat', label: 'الحلقات', icon: <BookOpenIcon /> },
        { page: 'attendance', label: 'الحضور', icon: <ClipboardListIcon /> },
        { page: 'memorization', label: 'الحفظ', icon: <BookOpenIcon /> },
        { page: 'reports', label: 'التقارير', icon: <ChartBarIcon /> },
        { page: 'settings', label: 'الإعدادات', icon: <CogIcon /> },
    ];
    
    const teacherNavItems: { page: Page; label: string; icon: React.ReactNode }[] = [
        { page: 'dashboard', label: 'الرئيسية', icon: <HomeIcon /> },
        { page: 'students', label: 'طلابي', icon: <UsersIcon /> },
        { page: 'halaqat', label: 'حلقاتي', icon: <BookOpenIcon /> },
        { page: 'attendance', label: 'تسجيل الحضور', icon: <ClipboardListIcon /> },
        { page: 'memorization', label: 'متابعة الحفظ', icon: <BookOpenIcon /> },
        { page: 'settings', label: 'الإعدادات', icon: <CogIcon /> },
    ];

    const getNavItems = () => {
        switch (currentUser.role) {
            case 'admin': return adminNavItems;
            case 'teacher': return teacherNavItems;
            default: return [];
        }
    }
    
    const navItems = getNavItems();
    
    const handleNavigation = (page: Page) => {
        setCurrentPage(page);
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }
    
    const handleLogout = () => {
        onLogout();
    };

    const getRoleName = () => {
        switch (currentUser.role) {
            case 'admin': return 'مدير النظام';
            case 'teacher': return 'معلم';
            default: return '';
        }
    }

    return (
    <div className="print:hidden">
        {/* Overlay for mobile */}
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
        
        <div className={`fixed md:relative flex-shrink-0 w-64 h-full bg-green-800 dark:bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
            <div className="flex items-center justify-center h-20 border-b border-green-700 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-amber-400 dark:text-amber-500">نظام قرآني</h1>
            </div>
            <nav className="flex-1 p-4">
                <ul>
                    {navItems.map(item => (
                        <NavItem 
                            key={item.page}
                            icon={item.icon}
                            label={item.label}
                            isActive={currentPage === item.page}
                            onClick={() => handleNavigation(item.page)}
                        />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-green-700 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{currentUser.name}</p>
                        <p className="text-sm text-green-300 dark:text-gray-400">
                            {getRoleName()}
                        </p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-green-200 hover:text-white dark:text-gray-400 dark:hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-green-700 dark:hover:bg-gray-700"
                        title="تسجيل الخروج"
                        aria-label="تسجيل الخروج"
                    >
                        <LogoutIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};