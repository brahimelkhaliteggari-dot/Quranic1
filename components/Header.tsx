import React from 'react';

interface HeaderProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between h-16 bg-white dark:bg-gray-800 shadow-md px-6 flex-shrink-0 print:hidden">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="text-gray-500 dark:text-gray-400 focus:outline-none md:hidden">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mr-4">{pageTitle}</h1>
      </div>
      <div className="flex items-center">
        {/* Can add other header items here like search or notifications */}
      </div>
    </header>
  );
};