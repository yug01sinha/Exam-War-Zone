"use client";

import { useEffect, useState } from 'react';

interface SubjectData {
  subject: string;
  progress: number;
  chapters: string;
  emoji: string;
}

interface SubjectProgressGridProps {
  subjects: SubjectData[];
  isMockData?: boolean; // Flag to indicate if data is mock
  className?: string;
}

export default function SubjectProgressGrid(props: SubjectProgressGridProps) {
  const { subjects, isMockData = false, className } = props;
  const [animatedSubjects, setAnimatedSubjects] = useState<SubjectData[]>([]);

  // Animate subjects in with staggered delay
  useEffect(() => {
    const timedSubjects = subjects.map((subject, index) => ({
      ...subject,
      delay: index * 60 // 60ms delay between each
    }));

    const animated: SubjectData[] = [];
    let completed = 0;

    const interval = setInterval(() => {
      if (completed < timedSubjects.length) {
        animated.push(timedSubjects[completed]);
        setAnimatedSubjects([...animated]);
        completed++;
      } else {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [subjects]);

  // Display mock data warning in development
  // In production, you might want to remove this or handle it differently
  if (process.env.NODE_ENV === 'development' && isMockData) {
    console.warn('SubjectProgressGrid: Using mock data');
  }

  return (
    <div className={`grid gap-4 ${className || ''}`}>
      <div className="grid grid-cols-2 gap-4">
        {animatedSubjects.map((subject, index) => (
          <div
            key={index}
            className={`subject-card opacity-0 transform translate-y-4 ${
              !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'animate-fadeup delay-[${subject.delay || 0}ms]'
                : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="subject-thumb relative flex items-center justify-center overflow-hidden h-[118px]">
              <div className={`emoji text-5xl relative z-2 drop-shadow-[0_6px_14px_rgba(0,0,0,0.15)]`}>
                {subject.emoji}
              </div>
              <div className="absolute inset-0 opacity-90"
                   style={{
                     backgroundImage: getGradientForSubject(subject.subject)
                   }}></div>
            </div>

            <div className="subject-body p-4">
              <h3 className="text-lg font-bold mb-3">{subject.subject}</h3>

              <div className="track h-1.5 bg-tint rounded-full overflow-hidden mb-2">
                <div
                  className="fill h-full bg-grad rounded-full transition-all duration-1100 ease-[cubic-bezier(0.16,0.8,0.3,1)]"
                  style={{ width: `${subject.progress}%` }}
                ></div>
              </div>

              <div className="subject-meta flex justify-between text-xs text-muted font-semibold mt-2 mb-3">
                <span>{subject.chapters}</span>
                <span className="pct font-jetbrains-mono text-ink">{subject.progress}%</span>
              </div>

              <button className="btn-continue w-full px-3 py-2.5 rounded-lg bg-ink text-white text-sm font-semibold transition-transform duration-180 hover:-translate-y-[2px]">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to get gradient based on subject
function getGradientForSubject(subject: string): string {
  switch (subject) {
    case 'Mathematics':
      return 'linear-gradient(135deg, #5b4bf5, #8b7cff)';
    case 'Science':
      return 'linear-gradient(135deg, #1fb571, #8be0b8)';
    case 'Social Science':
      return 'linear-gradient(135deg, #e0724f, #f5c26b)';
    case 'English':
      return 'linear-gradient(135deg, #4f8cf7, #8bd0ff)';
    default:
      return 'linear-gradient(135deg, #5b4bf5, #8b5cf6)';
  }
}