"use client";

import { useEffect, useState } from 'react';

interface ProfileData {
  name: string;
  handle: string;
  avatar: string; // Initials or image URL
  streak: number;
  testsDone: number;
  rank: string;
  currentMonth: string;
  currentDate: number;
  events: Array<{ tag: string; time: string; desc: string }>;
}

interface ProfilePanelProps {
  data: ProfileData;
  isMockData?: boolean; // Flag to indicate if data is mock
  className?: string;
}

export default function ProfilePanel({ data, isMockData = false, className }: ProfilePanelProps) {
  const [currentMonth, setCurrentMonth] = useState<string>(data.currentMonth);
  const [currentDate, setCurrentDate] = useState<number>(data.currentDate);

  // Month names for navigation
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthIndex = months.indexOf(currentMonth);

  const handlePrevMonth = () => {
    let newIndex = currentMonthIndex - 1;
    let newYear = 2024; // Assuming current year
    if (newIndex < 0) {
      newIndex = 11;
      newYear -= 1;
    }
    setCurrentMonth(months[newIndex]);
    // In a real app, we'd also update the year and recalculate dates
  };

  const handleNextMonth = () => {
    let newIndex = currentMonthIndex + 1;
    let newYear = 2024; // Assuming current year
    if (newIndex > 11) {
      newIndex = 0;
      newYear += 1;
    }
    setCurrentMonth(months[newIndex]);
    // In a real app, we'd also update the year and recalculate dates
  };

  // Generate calendar days for the current month (simplified)
  const daysInMonth = 31; // Simplified - would calculate properly in real app
  const firstDayOfMonth = new Date(`${currentMonth} 1, 2024`).getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7;

  const daysArray = [];
  // Add empty cells for days before the 1st
  for (let i = 0; i < adjustedFirstDay; i++) {
    daysArray.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    daysArray.push(day);
  }

  // Display mock data warning in development
  if (process.env.NODE_ENV === 'development' && isMockData) {
    console.warn('ProfilePanel: Using mock data');
  }

  return (
    <div className={`panel profile-panel ${className || ""}`}>
      <div className="profile-top flex items-center gap-3.5 mb-5 relative">
        <div className="p-avatar w-[54px] h-[54px] rounded-[14px] bg-white/20 border border-white/30 flex items-center justify-center font-bold text-xl shrink-0">
          {data.avatar}
        </div>
        <div className="space-y-1">
          <p className="p-name text-lg font-bold text-white">{data.name}</p>
          <p className="p-handle text-xs opacity-75 text-white">{data.handle}</p>
        </div>
      </div>

      <div className="pill-row flex gap-2 mb-5.5 relative">
        <div className="stat-pill flex-1 bg-white/16 rounded-[13px] px-2.5 py-2.5 text-center">
          <b className="block font-jetbrains-mono text-2xl text-white">{data.streak}</b>
          <span className="text-xs opacity-8 font-semibold text-white">Day streak</span>
        </div>
        <div className="stat-pill flex-1 bg-white/16 rounded-[13px] px-2.5 py-2.5 text-center">
          <b className="block font-jetbrains-mono text-2xl text-white">{data.testsDone}</b>
          <span className="text-xs opacity-8 font-semibold text-white">Tests done</span>
        </div>
        <div className="stat-pill flex-1 bg-white/16 rounded-[13px] px-2.5 py-2.5 text-center">
          <b className="block font-jetbrains-mono text-2xl text-white">{data.rank}</b>
          <span className="text-xs opacity-8 font-semibold text-white">Squad rank</span>
        </div>
      </div>

      <div className="cal-card bg-white/14 rounded-lg p-4 relative">
        <div className="cal-top flex items-center justify-between mb-3 font-bold text-sm">
          <div className="cal-arrow w-[22px] h-[22px] rounded-sm bg-white/15 flex items-center justify-center cursor-pointer shrink-0" onClick={handlePrevMonth}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white">{currentMonth}</span>
          <div className="cal-arrow w-[22px] h-[22px] rounded-sm bg-white/15 flex items-center justify-center cursor-pointer shrink-0" onClick={handleNextMonth}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <div className="cal-days grid grid-cols-7 gap-1 text-center mb-1.5">
          {/* Day headers */}
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Mon</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Tue</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Wed</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Thu</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Fri</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Sat</div>
          <div className="cal-day text-xs opacity-65 font-semibold mb-1.5 text-white">Sun</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysArray.map((day, index) => (
            <div key={index} className={`flex items-center justify-center w-[26px] h-[26px] text-sm font-bold text-white rounded relative ${day === null ? 'opacity-0' : ''} ${day === data.currentDate ? 'bg-white text-indigo' : ''}`}>
              {day !== null && (
                <>
                  <span>{day}</span>
                  {day === data.currentDate && (
                    <span className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-white"></span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="events-title font-bold text-sm text-white mt-5 mb-3 relative">Upcoming</div>

      <div className="space-y-2.5">
        {data.events.map((event, index) => (
          <div key={index} className="event-card bg-white/14 rounded-lg p-3.5 mb-2.5 relative">
            <div className="event-top flex justify-between items-center mb-2">
              <span className="event-tag text-xs font-bold bg-white/22 px-2 py-0.5 rounded-[7px] text-white">{event.tag}</span>
              <span className="event-time text-xs font-bold bg-white text-ink px-2 py-0.5 rounded-[7px]">{event.time}</span>
            </div>
            <p className="event-desc text-xs leading-1.4 opacity-92 text-white">{event.desc}</p>
          </div>
        ))}
      </div>

      <button className="btn-viewall w-full mt-1.5 px-3 py-2.5 rounded-lg bg-white text-ink font-bold text-sm cursor-pointer relative">
        View all events
      </button>
    </div>
  );
}