import { createServerClient } from '@/lib/supabase';
import { createCookieAdapter } from '@/lib/cookie-adapter';
import VideoTable from './components/VideoTable';

export type VideoRow = {
  id: string;
  chapter_name: string;
  subject: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
  subtopic_count: number;
};

async function getVideos(): Promise<VideoRow[]> {
  const cookieAdapter = await createCookieAdapter();
  const supabase = createServerClient(cookieAdapter);

  const { data: videos, error } = await supabase
    .from('videos')
    .select('*, subtopics(count)')
    .order('created_at', { ascending: false });

  if (error || !videos) return [];

  return (videos as any[]).map((v) => ({
    id: v.id,
    chapter_name: v.chapter_name,
    subject: v.subject,
    title: v.title,
    thumbnail_url: v.thumbnail_url,
    duration_seconds: v.duration_seconds,
    subtopic_count: v.subtopics?.[0]?.count ?? 0,
  }));
}

export default async function AdminVideosPage() {
  const videos = await getVideos();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Videos</h1>
        <a
          href="/admin/videos/new"
          className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
          style={{ background: 'var(--grad)' }}
        >
          + Add Video
        </a>
      </div>
      <VideoTable videos={videos} />
    </div>
  );
}
