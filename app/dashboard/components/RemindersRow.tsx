"use client";

import { useEffect, useState } from 'react';

export interface ReminderData {
  title: string;
  due: string;
  buttonText: string;
  buttonIcon?: string | null;
  variant: 'c1' | 'c2' | 'c3';
  delay?: number; // for animation
}

interface RemindersRowProps {
  reminders: ReminderData[];
  isMockData?: boolean; // Flag to indicate if data is mock
  className?: string;
}

export default function RemindersRow({ reminders, isMockData = false, className }: RemindersRowProps) {
  const [visibleReminders, setVisibleReminders] = useState<ReminderData[]>([]);

  // Animate reminders in with staggered delay
  useEffect(() => {
    const timedReminders = reminders.map((reminder, index) => ({
      ...reminder,
      delay: index * 80 // 80ms delay between each
    }));

    const animated: ReminderData[] = [];
    let completed = 0;

    const interval = setInterval(() => {
      if (completed < timedReminders.length) {
        animated.push(timedReminders[completed]);
        setVisibleReminders([...animated]);
        completed++;
      } else {
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [reminders]);

  // Display mock data warning in development
  if (process.env.NODE_ENV === 'development' && isMockData) {
    console.warn('RemindersRow: Using mock data');
  }

  return (
    <div className={`mt-4 ${className || ""}`}>
      <div className="reminder-grid grid grid-cols-3 gap-3.5">
        {visibleReminders.map((reminder, index) => (
          <div
            key={index}
            className={`rem-card rem-card-${reminder.variant} opacity-0 transform translate-y-4 ${
              !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? `animate-fadeup delay-[${reminder.delay || 0}ms]`
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="rem-title text-sm font-bold">{reminder.title}</div>
            <div className="rem-due text-xs text-muted">{reminder.due}</div>
            <button className="btn-mini mt-auto px-3 py-2 rounded-lg bg-ink text-white text-xs font-semibold flex items-center gap-1.5 self-start">
              {reminder.buttonIcon && <img src={reminder.buttonIcon} alt="Icon" className="w-4 h-4" />}
              <span>{reminder.buttonText}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend flex gap-4 mt-2 text-xs text-muted font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="d w-[7px] h-[7px] rounded-full bg-indigo" aria-hidden="true"></span>
          Learn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="d w-[7px] h-[7px] rounded-full bg-[#e0724f]" aria-hidden="true"></span>
          Test
        </span>
        <span className="flex items-center gap-1.5">
          <span className="d w-[7px] h-[7px] rounded-full bg-gold" aria-hidden="true"></span>
          Revise
        </span>
      </div>
    </div>
  );
}