"use client";

import { useEffect, useState } from 'react';

interface WeakTopicData {
  subject: string;
  topic: string;
  confidence: number; // percentage
  misses: number;
  mastery: number; // percentage
  thumbnailBg: string;
  emoji: string;
}

interface WeakTopicsPanelProps {
  topics: WeakTopicData[];
  isMockData?: boolean; // Flag to indicate if data is mock
  className?: string;
}

export default function WeakTopicsPanel({ topics, isMockData = false, className }: WeakTopicsPanelProps) {
  const [visibleTopics, setVisibleTopics] = useState<WeakTopicData[]>([]);

  // Animate topics in with staggered delay
  useEffect(() => {
    const timedTopics = topics.map((topic, index) => ({
      ...topic,
      delay: index * 100 // 100ms delay between each
    }));

    const animated: WeakTopicData[] = [];
    let completed = 0;

    const interval = setInterval(() => {
      if (completed < timedTopics.length) {
        animated.push(timedTopics[completed]);
        setVisibleTopics([...animated]);
        completed++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [topics]);

  // Display mock data warning in development
  if (process.env.NODE_ENV === 'development' && isMockData) {
    console.warn('WeakTopicsPanel: Using mock data');
  }

  return (
    <div className={`panel ${className || ''}`}>
      <div className="panel-head">
        <h2 className="text-lg font-bold">Weak topics</h2>
        <span className="text-xs font-bold text-indigo cursor-pointer">View all</span>
      </div>

      <div className="mt-4">
        <div className="space-y-3">
          {visibleTopics.map((topic, index) => (
            <div key={index} className="tc-row flex items-center gap-3 py-3 border-t border-border first:border-t-0">
              <div
                className={`tc-thumb w-[44px] h-[44px] rounded-lg flex-shrink-0 flex items-center justify-center text-xl`}
                style={{ backgroundColor: topic.thumbnailBg }}
              >
                {topic.emoji}
              </div>

              <div className="tc-body flex-1 min-w-0">
                <div className="tc-title text-sm font-bold">{topic.topic}</div>
                <div className="tc-tag ${getTagClass(topic.confidence)} text-xs font-bold px-2 py-0.5 rounded">
                  ${getTagLabel(topic.confidence)}
                </div>
              </div>

              <div className="tc-stats flex items-center gap-3.5 text-xs text-muted font-semibold flex-shrink-0">
                <span className="flex items-center gap-1">
                  {/* Simple circle icon for misses */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  {topic.misses} misses
                </span>
                <span className="flex items-center gap-1">
                  ⭐ {topic.mastery}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper function to determine tag class based on confidence
function getTagClass(confidence: number): string {
  if (confidence >= 60) {
    return 'tc-tag.beg'; // Beginner (green-ish)
  } else if (confidence >= 40) {
    return 'tc-tag.int'; // Intermediate (orange-ish)
  } else {
    return 'tc-tag.adv'; // Advanced (gray-ish)
  }
}

// Helper function to determine tag label based on confidence
function getTagLabel(confidence: number): string {
  if (confidence >= 60) {
    return 'Beginner';
  } else if (confidence >= 40) {
    return 'Intermediate';
  } else {
    return 'Advanced';
  }
}