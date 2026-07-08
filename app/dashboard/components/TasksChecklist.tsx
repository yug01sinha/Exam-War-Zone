"use client";

import { useState } from 'react';

interface TaskItem {
  id: number;
  title: string;
  completed: boolean;
}

const mockTasks: TaskItem[] = [
  { id: 1, title: "Complete Quadratic Equations practice", completed: true },
  { id: 2, title: "Watch Photosynthesis video", completed: false },
  { id: 3, title: "Complete Chemical Equations worksheet", completed: true },
  { id: 4, title: "Read chapter on Democratic Politics", completed: false },
];

export default function TasksChecklist() {
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Today's Tasks</h3>
        <p className="mt-1 text-sm text-gray-500">
          {completedCount} of {tasks.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <label
            key={task.id}
            className="flex items-start space-x-3"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <div className="flex-1 space-y-1">
              <p className={`text-sm font-medium text-gray-900 ${
                task.completed ? 'line-through text-gray-500' : ''
              } transition-all duration-200`}>
                {task.title}
              </p>
              {task.completed && (
                <p className="text-xs text-green-600 mt-0.5">
                  Completed
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}