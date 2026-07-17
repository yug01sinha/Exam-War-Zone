"use client";

import { useEffect, useState } from 'react';

export default function FocusAreas() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  // Staggered animation effect for focus areas
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setVisibleItems([0]);
    }, 100);

    const timer2 = setTimeout(() => {
      setVisibleItems([0, 1]);
    }, 200);

    const timer3 = setTimeout(() => {
      setVisibleItems([0, 1, 2]);
    }, 300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const focusAreas = [
    { subject: "Mathematics", topic: "Quadratic Equations", confidence: 45, color: "indigo" },
    { subject: "Science", topic: "Chemical Reactions", confidence: 55, color: "rose" },
    { subject: "Social Science", topic: "Democratic Politics", confidence: 60, color: "teal" },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Focus Areas
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Topics that need attention based on your practice
        </p>
      </div>

      <div className="space-y-4">
        {focusAreas.map((area, index) => (
          <div
            key={index}
            className={`flex items-center space-x-3 transform translate-y-4 opacity-0 transition-all duration-500 ease-out ${
              visibleItems.includes(index) ? 'translate-y-0 opacity-100' : ''
            }`}
          >
            {/* Subject badge */}
            {/* Subject badge */}
            <div
              className={`px-2 py-0.5 text-xs font-medium rounded-full rounded-full  font-semibold-letter-spacing:medium rounded-full bg-${area.color}-100 text-${area.color}-800`}
            >
              {area.subject}
            </div>

            {/* Topic name */}
            <p className="text-sm font-medium text-gray-900 flex-1">
              {area.topic}
            </p>

            {/* Confidence meter */}
            <div className="w-20">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                <div
                  className={`h-full bg-gradient-to-r from-${area.color}-500 to-${area.color}-400 transition-all duration-500 ease-out ${
                    visibleItems.includes(index)
                      ? `w-[${area.confidence}%]`
                      : 'w-0'
                  }`}
                ></div>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 text-center">
                {area.confidence}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}