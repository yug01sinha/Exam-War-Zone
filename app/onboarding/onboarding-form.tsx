"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';

const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'];

interface Props {
  userId: string;
}

export default function OnboardingForm({ userId }: Props) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [step, setStep] = useState(1); // 1: strong, 2: weak, 3: study time
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [dailyStudyTime, setDailyStudyTime] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (subjects.length === 0) {
        setError('Please select at least one strong subject');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (weakSubjects.length === 0) {
        setError('Please select at least one weak subject');
        return;
      }
      // Check for overlap
      const intersection = strongSubjects.filter((subject) =>
        weakSubjects.includes(subject)
      );
      if (intersection.length > 0) {
        setError(
          `Subjects cannot be both strong and weak: ${intersection.join(', ')}`
        );
        return;
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate: no overlap between strong and weak subjects
      const intersection = strongSubjects.filter((subject) =>
        weakSubjects.includes(subject)
      );
      if (intersection.length > 0) {
        setError(
          `Subjects cannot be both strong and weak: ${intersection.join(', ')}`
        );
        setLoading(false);
        return;
      }

      // Upsert the user profile
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(
          {
            user_id: userId,
            strong_subjects: strongSubjects,
            weak_subjects: weakSubjects,
            daily_study_time_minutes: dailyStudyTime,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (upsertError) throw upsertError;

      setSuccess('Setup complete! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-blue-50">
      <div className="w-full max-w-md space-y-6 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Setup Your Profile
        </h2>
        <div className="text-sm text-center text-gray-500">
          Step {step} of 3
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select your strong subjects (you're confident in these):
            </p>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    value={subject}
                    checked={strongSubjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setStrongSubjects([...strongSubjects, subject]);
                      } else {
                        setStrongSubjects(
                          strongSubjects.filter((s) => s !== subject)
                        );
                      }
                    }}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="ml-2">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Select your weak subjects (you want to improve in these):
            </p>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center">
                  <input
                    type="checkbox"
                    value={subject}
                    checked={weakSubjects.includes(subject)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWeakSubjects([...weakSubjects, subject]);
                      } else {
                        setWeakSubjects(
                          weakSubjects.filter((s) => s !== subject)
                        );
                      }
                    }}
                    className="h-4 w-4 text-indigo-600"
                    // Disable if already selected as strong
                    disabled={strongSubjects.includes(subject)}
                  />
                  <span className="ml-2 {strongSubjects.includes(subject) ? 'line-through text-gray-400' : ''}">
                    {subject}
                  </span>
                </label>
              ))}
            </div>
            {strongSubjects.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                Note: Subjects selected as strong are grayed out and cannot be selected as weak.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              How much time can you study per day? (in minutes)
            </p>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="1440"
                value={dailyStudyTime === '' ? '' : dailyStudyTime}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setDailyStudyTime(val);
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g., 60"
              />
              <span className="ml-2 text-gray-600">minutes</span>
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </p>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || dailyStudyTime === ''}
            >
              {loading ? 'Saving...' : 'Finish Setup'}
            </button>
          )}
        </div>

        <p className="text-sm text-center text-gray-500 mt-4">
          <a href="/login" className="font-medium text-indigo-600 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}