"use client";

import { Calendar, CheckCircle, TrendingUp } from '@heroicons/react/24/solid';

interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function StatsCards() {
  const mockStats: StatCard[] = [
    {
      title: 'Days Until Exam',
      value: '45',
      icon: Calendar,
      color: 'indigo',
    },
    {
      title: 'Current Streak',
      value: '5 days',
      icon: CheckCircle,
      color: 'emerald',
    },
    {
      title: "Today's Tasks",
      value: '3 of 5 completed',
      icon: TrendingUp,
      color: 'rose',
    },
    {
      title: 'Overall Progress',
      value: '60%',
      icon: CheckCircle,
      color: 'teal',
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {mockStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className={`mt-1 text-2xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
            </div>
            <div className="h-12 w-12 bg-${stat.color}-50 rounded-md flex items-center justify-center">
              <stat.icon className={`h-5 w-5 text-${stat.color}-600 transition-transform duration-300 hover:scale-110`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}