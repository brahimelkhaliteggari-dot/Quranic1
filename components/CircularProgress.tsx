import React from 'react';

interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
    progress,
    size = 120,
    strokeWidth = 10,
    color = '#2E7D32',
}) => {
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
                className="text-gray-200 dark:text-gray-600"
                stroke="currentColor"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={radius}
                cx={center}
                cy={center}
            />
            <circle
                stroke={color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                r={radius}
                cx={center}
                cy={center}
                style={{
                    transform: 'rotate(-90deg)',
                    transformOrigin: '50% 50%',
                    transition: 'stroke-dashoffset 0.5s ease-in-out',
                }}
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy=".3em"
                className="text-xl font-bold fill-current text-gray-700 dark:text-gray-200"
            >
                {`${Math.round(progress)}%`}
            </text>
        </svg>
    );
};