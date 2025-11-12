
import React from 'react';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'blue' | 'red';
  change?: string;
  changeType?: 'increase' | 'decrease';
  changeText?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-green-100 dark:bg-green-900/50',
    border: 'border-green-500 dark:border-green-600',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/50',
    border: 'border-amber-500 dark:border-amber-600',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/50',
    border: 'border-blue-500 dark:border-blue-600',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/50',
    border: 'border-red-500 dark:border-red-600',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, change, changeType, changeText = 'عن الأسبوع الماضي' }) => {
  const { bg, border } = colorClasses[color];

  return (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border-b-4 ${border}`}>
      <div className="flex items-center justify-between">
         <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
         </div>
        <div className={`p-3 rounded-full ${bg}`}>
          {icon}
        </div>
      </div>
      {change && changeType && (
        <div className="mt-2 flex items-center text-xs">
          <span className={`flex items-center gap-1 font-semibold ${changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {changeType === 'increase' ? <ArrowUpIcon className="w-3 h-3"/> : <ArrowDownIcon className="w-3 h-3"/>}
            {change}
          </span>
          <span className="text-gray-500 dark:text-gray-400 mr-1">{changeText}</span>
        </div>
      )}
    </div>
  );
};
