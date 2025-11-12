import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 01-2.25-2.25V9.375a3.375 3.375 0 01.938-2.238l3-3.001a3.375 3.375 0 014.774 0l3 3.001a3.375 3.375 0 01.938 2.238v7.125a2.25 2.25 0 01-2.25 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18.75v2.25a1.5 1.5 0 001.5 1.5h3a1.5 1.5 0 001.5-1.5v-2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12h10.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.375c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875" />
    </svg>
);
