"use client";

import { useEffect, useState } from 'react';
import { CalendarIcon, CheckIcon, ChartPieIcon } from '@heroicons/react/24/solid';

interface StatCard {
  title: string;
  value: string;
  color: string;
  isProgress?: boolean;
  progressValue?: number;
}

// Simple flame SVG component
const FlameSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={className}>
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.25c-1.8 0-3.3 1.05-3.9 2.55C7.65 6.6 6 9.15 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.85-1.65-5.4-3.9-6.45C15.3 3.3 13.8 2.25 12 2.25ZM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6Z" fill="currentColor" />
    </svg>
  </div>
);

const mockStats: StatCard[] = [
  {
    title: 'Days Until Exam',
    value: '45',
    color: 'blue',
  },
  {
    title: 'Current Streak',
    value: '5 days',
    color: 'orange',
  },
  {
    title: "Today's Tasks",
    value: '3 of 5 completed',
    color: 'green',
  },
  {
    title: 'Overall Progress',
    value: '60%',
    color: 'purple',
    isProgress: true,
    progressValue: 60,
  },
];

export default function StatsCards() {
  const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
  const [progressWidths, setProgressWidths] = useState<number[]>([]);

  // Staggered animation effect for cards
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    mockStats.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleIndexes((prev) => [...prev, index]);
      }, index * 80); // 80ms delay between each card
      timers.push(timer);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  // Animate progress bars
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    const progressStats = mockStats.filter((stat) => stat.isProgress);
    progressStats.forEach((stat, index) => {
      const timer = setTimeout(() => {
        setProgressWidths((prev) => {
          const newWidths = [...prev];
          newWidths[index] = stat.progressValue || 0;
          return newWidths;
        });
      }, 300); // Start after card animation
      timers.push(timer);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {mockStats.map((stat, index) => {
          const isVisible = visibleIndexes.includes(index);
          const progressIndex = [
            ...mockStats
              .map((s, i) => (s.isProgress ? i : -1))
              .filter((i) => i !== -1),
          ].indexOf(index);
          const progressWidth = progressWidths[progressIndex] || 0;

          return (
            <div
              key={index}
              className={`
                bg-white rounded-lg border-l-4 p-6
                ${getBorderColorClass(stat.color)}
                hover:-translate-y-1 hover:shadow-lg transition-all duration-300
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                transition-all duration-500 ease-out
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                  <p className={`mt-1 text-3xl font-bold text-${stat.color}-600 ${stat.isProgress ? 'bg-clip-text text-transparent bg-gradient-to-r from-${stat.color}-800 to-blue-800' : ''}`}>
                    {stat.value}
                  </p>
                </div>
                <div className="flex items-center">
                  {/* Icon badge with pastel background */}
                  <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${stat.color}-100 flex items-center justify-center mb-0.5`}>
                    {stat.title === 'Days Until Exam' && (
                      <CalendarIcon className={`h-5 w-5 text-${stat.color}-600`} />
                    )}
                    {stat.title === 'Current Streak' && (
                      <FlameSVG className={`h-5 w-5 text-${stat.color}-600 flame-svg`} />
                    )}
                    {stat.title === "Today's Tasks" && (
                      <CheckIcon className={`h-5 w-5 text-${stat.color}-600`} />
                    )}
                    {stat.title === 'Overall Progress' && (
                      <ChartPieIcon className={`h-5 w-5 text-${stat.color}-600`} />
                    )}
                  </div>
                  {/* Progress bar for Overall Progress */}
                  {stat.isProgress && (
                    <div className="mt-2 w-10 h-1.5 bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${stat.color}-600 to-blue-600 transition-width duration-1000 ease-out`}
                        style={{ width: `${progressWidth}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Style for flame pulse animation */}
      <style jsx>{`
        .flame-svg {
          animation: pulse 2s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}

// Helper function to get the border class for the left border
function getBorderColorClass(color: string): string {
  switch (color) {
    case 'blue':
      return 'border-l-4 border-blue-200';
    case 'orange':
      return 'border-l-4 border-orange-200';
    case 'green':
      return 'border-l-4 border-green-200';
    case 'purple':
      return 'border-l-4 border-purple-200';
    default:
      return 'border-l-4 border-gray-200';
  }
}