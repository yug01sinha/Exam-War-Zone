"use client";

import { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface TaskItem {
  id: number;
  title: string;
  completed: boolean;
  subject: string;
}

// Simple circle SVG for unchecked state
const CircleSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={className}>
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    </svg>
  </div>
);

const mockTasks: TaskItem[] = [
  { id: 1, title: "Complete Quadratic Equations practice", completed: true, subject: "Mathematics" },
  { id: 2, title: "Watch Photosynthesis video", completed: false, subject: "Science" },
  { id: 3, title: "Complete Chemical Equations worksheet", completed: true, subject: "Science" },
  { id: 4, title: "Read chapter on Democratic Politics", completed: false, subject: "Social Science" },
];

export default function TodaysTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [isVisible, setIsVisible] = useState(false);

  // Fade in the section after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 400); // Start after the last stat card (assuming 4 cards with 80ms delay: 0, 80, 160, 240 -> last at 240, so 400 is safe)
    return () => clearTimeout(timer);
  }, []);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transform translate-y-4 opacity-0 ${isVisible ? 'translate-y-0 opacity-100' : ''} transition-all duration-500 ease-out`}>
      <style jsx>{`
        .bounce-check {
          animation: bounce 0.6s ease-in-out;
        }
        @keyframes bounce {
          0%, 100% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
        }
      `}</style>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
        <p className="mt-1 text-sm text-gray-500">
          {completedCount} of {tasks.length} completed
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const subjectColorClass = ({
            Mathematics: 'bg-purple-500',
            Science: 'bg-teal-500',
            'Social Science': 'bg-orange-500',
            English: 'bg-green-500',
            Hindi: 'bg-pink-500',
          }[task.subject] ?? 'bg-gray-500');

          return (
            <div key={task.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
              {/* Subject dot */}
              <div
                className={`h-2.5 w-2.5 rounded-full ${subjectColorClass}`}
              ></div>

              {/* Checkbox and text */}
              <div className="flex-1 space-x-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="sr-only" /* Hide the native checkbox */
                  />
                  <span className="relative w-5 h-5 flex-shrink-0">
                    <span className="absolute inset-0 flex items-center justify-center">
                      {task.completed ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600 bounce-check" />
                      ) : (
                        <CircleSVG className="h-4 w-4 text-gray-300 transform transition-transform duration-300" />
                      )}
                    </span>
                  </span>
                  <span
                    className={`
                      ml-3 text-gray-900
                      ${task.completed ? 'line-through' : ''}
                      transition-all duration-300
                    `}
                  >
                    {task.title}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
        <span>{completedCount} of {tasks.length} completed</span>
        <div className="w-6 h-1 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full bg-green-500 transition-width duration-500 ease-out"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}