"use client";

import { useEffect, useState } from 'react';

interface ChartDataPoint {
  day: string;
  hours: number;
  isToday?: boolean;
}

interface AnalyticsData {
  weekData: ChartDataPoint[];
  monthData: ChartDataPoint[];
}

interface AnalyticsPanelProps {
  data: AnalyticsData;
  isMockData?: boolean; // Flag to indicate if data is mock
  className?: string;
}

export default function AnalyticsPanel({ data, isMockData = false, className }: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<'week' | 'month'>('week');
  const [animatedHeights, setAnimatedHeights] = useState<number[]>([]);

  // Animate bar heights when data or tab changes
  useEffect(() => {
    const dataToAnimate = activeTab === 'week' ? data.weekData : data.monthData;

    // Reset heights
    setAnimatedHeights(Array(dataToAnimate.length).fill(0));

    // Animate each bar with delay
    const timer = setTimeout(() => {
      dataToAnimate.forEach((point, index) => {
        setTimeout(() => {
          setAnimatedHeights(prev => {
            const newPrev = [...prev];
            newPrev[index] = point.hours;
            return newPrev;
          });
        }, index * 90); // 90ms delay between each bar
      });

      // Final state after all animations
      setTimeout(() => {
        setAnimatedHeights(dataToAnimate.map(point => point.hours));
      }, dataToAnimate.length * 90 + 100);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, activeTab]);

  // Display mock data warning in development
  if (process.env.NODE_ENV === 'development' && isMockData) {
    console.warn('AnalyticsPanel: Using mock data');
  }

  const getBarClasses = (isToday: boolean) => {
    return `w-[60%] rounded-tl-[8px] rounded-tr-[8px] rounded-br-[4px] rounded-bl-[4px]
            ${isToday ? 'bg-gradient-to-t from-blue to-indigo' : 'bg-gradient-to-t from-violet to-indigo'}
            h-0 transition-all duration-1000 ease-[cubic-bezier(0.16,0.8,0.3,1)] relative`;
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className={`panel ${className || ""}`}>
      <div className="panel-head">
        <h2 className="text-lg font-bold">Study time</h2>
        <div className="toggle-group bg-tint rounded-lg p-0.5 gap-0.5">
          <button
            className={`toggle-btn px-3.5 py-2 text-xs font-semibold ${activeTab === 'week' ? 'bg-ink text-white' : 'bg-transparent hover:text-white/80'}`}
            onClick={() => setActiveTab('week')}
          >
            Week
          </button>
          <button
            className={`toggle-btn px-3.5 py-2 text-xs font-semibold ${activeTab === 'month' ? 'bg-ink text-white' : 'bg-transparent hover:text-white/80'}`}
            onClick={() => setActiveTab('month')}
          >
            Month
          </button>
        </div>
      </div>

      <div className="chart-wrap relative mt-4">
        {/* Chart grid (horizontal lines and labels) */}
        <div className="chart-grid absolute inset-x-0 bottom-[30px] flex flex-col justify-between">
          {[4, 3, 2, 1, 0].map((hours, index) => (
            <div key={index} className="gline border-t-[1px] border-dashed border-border relative">
              <span className="absolute left-[-28px] top-[-7px] text-xs text-muted font-jetbrains-mono">{hours}h</span>
            </div>
          ))}
        </div>

        {/* Bar columns */}
        <div className="flex-1 flex flex-row gap-3.5 pt-4">
          {((activeTab === 'week' ? data.weekData : data.monthData) || daysOfWeek.map(day => ({ day, hours: 0, isToday: false })))
            .map((day, index) => {
              const isToday = day.isToday || (day.day === new Date().toLocaleDateString(undefined, { weekday: 'short' }) && activeTab === 'week');
              return (
                <div key={index} className="bar-col flex flex-col items-center justify-end gap-2 relative z-2">
                  <div
                    className={getBarClasses(isToday)}
                    style={{ height: `${animatedHeights[index] || 0}%` }}
                  >
                    {isToday && (
                      <div className="bar-dot w-[7px] h-[7px] rounded-full bg-ink absolute top-[-11px] left-1/2 -translate-x-1/2"></div>
                    )}
                  </div>
                  <div className="day-label text-xs text-muted font-semibold mt-0.5
                          ${isToday ? 'text-ink font-bold' : ''}">
                    {day.day}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}