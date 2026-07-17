import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

import DashboardLayout from '@/app/dashboard/components/DashboardLayout';
// Individual components that will be used within the layout
import DashboardHeader from '@/app/dashboard/components/DashboardHeader';
import SubjectProgressGrid from '@/app/dashboard/components/SubjectProgressGrid';
import RemindersRow from '@/app/dashboard/components/RemindersRow';
import AnalyticsPanel from '@/app/dashboard/components/AnalyticsPanel';
import WeakTopicsPanel from '@/app/dashboard/components/WeakTopicsPanel';
import ProfilePanel from '@/app/dashboard/components/ProfilePanel';
import type { ReminderData } from '@/app/dashboard/components/RemindersRow';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const adaptedCookieStore = {
    get(name: string) {
      const cookie = cookieStore.get(name);
      return cookie ? cookie.value : null;
    },
    set(name: string, value: string, options: any) {
      cookieStore.set({ name, value, ...options });
    },
    delete(name: string, options: any) {
      cookieStore.delete({ name, ...options });
    },
  };
  const supabase = createServerClient(adaptedCookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    return redirect('/login');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  // Fetch user profile to check onboarding status
  type Profile = { onboarding_completed: boolean };
  let profile: Profile | null = null;
  let profileError = null;
  try {
    const { data: profileData, error: profileErr } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .maybeSingle<Profile>();

    profile = profileData as Profile || null;
    profileError = profileErr;
  } catch (err: any) {
    profileError = err;
  }

  if (profileError) {
    // Unexpected error, redirect to onboarding (safe fallback)
    return redirect('/onboarding');
  } else if (!profile) {
    // No profile exists yet (new user)
    return redirect('/onboarding');
  } else if (!profile.onboarding_completed) {
    // Profile exists but onboarding not completed
    return redirect('/onboarding');
  }

  // Extract user name from metadata or email
  const userName =
    (user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Student') as string;

  // Mock data for components that aren't connected to Supabase yet
  const mockSubjectProgress = [
    { subject: 'Mathematics', progress: 62, chapters: '07/12', emoji: '📐' },
    { subject: 'Science', progress: 81, chapters: '13/16', emoji: '🧪' },
    { subject: 'Social Science', progress: 45, chapters: '09/20', emoji: '🌍' },
    { subject: 'English', progress: 90, chapters: '09/10', emoji: '📖' },
  ];

  const mockReminders: ReminderData[] = [
    {
      title: 'Revise — Real Numbers',
      due: 'Due: today, 9:00 PM',
      buttonText: 'Open recap',
      buttonIcon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2"><path d="M4 4v5h5M4 20a7.9 7.9 0 0 1 4.9-2.9 9.9 9.9 0 1 1-4.9 2.9v-5h-5zm16-9v5h5M20 4a7.9 7.9 0 0 1-4.9 2.9 9.9 9.9 0 1 0 4.9-2.9v5h5z"/></svg>',
      variant: 'c1'
    },
    {
      title: 'Practice test — Circles',
      due: '15 questions, ~20 min',
      buttonText: 'mentra.examwarroom.app',
      buttonIcon: null,
      variant: 'c2'
    },
    {
      title: 'Squad-042 weekly test',
      due: 'Window closes in 23h 12m',
      buttonText: 'Start',
      buttonIcon: null,
      variant: 'c3'
    }
  ];

  const mockAnalyticsData = {
    weekData: [
      { day: 'Mon', hours: 45, isToday: false },
      { day: 'Tue', hours: 25, isToday: false },
      { day: 'Wed', hours: 70, isToday: false },
      { day: 'Thu', hours: 58, isToday: false },
      { day: 'Fri', hours: 35, isToday: true },
      { day: 'Sat', hours: 0, isToday: false },
      { day: 'Sun', hours: 0, isToday: false }
    ],
    monthData: [
      // 30 days of mock data would go here
    ]
  };

  const mockWeakTopics = [
    { subject: 'Mathematics', topic: 'Quadratic Equations', confidence: 45, misses: 3, mastery: 52, thumbnailBg: '#fdeeea', emoji: '📐' },
    { subject: 'Science', topic: 'Balancing Chemical Equations', confidence: 55, misses: 2, mastery: 61, thumbnailBg: '#eaf7f0', emoji: '🧪' },
    { subject: 'Social Science', topic: 'Federalism — Case Studies', confidence: 48, misses: 4, mastery: 48, thumbnailBg: 'var(--tint2)', emoji: '🌍' },
    { subject: 'English', topic: 'Figures of Speech', confidence: 74, misses: 1, mastery: 74, thumbnailBg: '#fdf4de', emoji: '📖' }
  ];

  const mockProfileData = {
    name: userName,
    handle: '@yug.s · Class 10',
    avatar: 'YS', // Initials
    streak: 12,
    testsDone: 3,
    rank: '#2',
    currentMonth: 'July',
    currentDate: 10,
    events: [
      { tag: 'Group test', time: '11 Jul', desc: 'Squad-042 mixed test — Trigonometry + Circles' },
      { tag: 'Test', time: '13 Jul', desc: 'Long test — full Mathematics syllabus so far' }
    ]
  };

  return (
    <DashboardLayout
      main={
        <>
          {/* Main column content */}
          <div className="main-col flex-1 flex flex-col gap-5 px-4 pt-4">
            {/* Dashboard Header (Topbar equivalent) */}
            <DashboardHeader userName={userName} className="mb-6" />

            {/* Subject Progress Grid - Using mock data */}
            <SubjectProgressGrid subjects={mockSubjectProgress} isMockData={true} className="mb-6" />

            {/* Reminders Row - Using mock data */}
            <RemindersRow reminders={mockReminders} isMockData={true} className="mb-6" />

            {/* Analytics Panel - Using mock data */}
            <AnalyticsPanel data={mockAnalyticsData} isMockData={true} className="mb-6" />

            {/* Weak Topics Panel - Using mock data */}
            <WeakTopicsPanel topics={mockWeakTopics} isMockData={true} className="mb-6" />
          </div>
        </>
      }
      right={
        <>
          {/* Right column content (Profile Panel) */}
          <aside className="right-col hidden lg:block w-[340px] flex-shrink-0">
            <ProfilePanel data={mockProfileData} isMockData={true} className="mb-6" />
          </aside>
        </>
      }
    />
  );
}