"use client";

export default function WeakTopics() {
  const weakTopics = [
    { subject: "Mathematics", topic: "Quadratic Equations", confidence: 45 },
    { subject: "Science", topic: "Chemical Reactions", confidence: 55 },
    { subject: "Social Science", topic: "Democratic Politics", confidence: 60 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Focus Areas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Topics that need attention based on your practice
        </p>
      </div>

      <div className="space-y-4">
        {weakTopics.map((topic, index) => (
          <div key={index} className="flex items-center space-x-3">
            {/* Subject badge */}
            <div
              className={`px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800`}
            >
              {topic.subject}
            </div>

            {/* Topic name */}
            <p className="text-sm font-medium text-gray-900 flex-1">
              {topic.topic}
            </p>

            {/* Confidence meter */}
            <div className="w-20">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-width duration-1000 ease-out w-[${topic.confidence}%]`}
                ></div>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 text-center">
                {topic.confidence}% confidence
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}