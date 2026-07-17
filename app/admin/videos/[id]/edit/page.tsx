import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { createCookieAdapter } from '@/lib/cookie-adapter';
import VideoForm, { type VideoFormData, type SubtopicData } from '../../components/VideoForm';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params;

  const cookieAdapter = await createCookieAdapter();
  const supabase = createServerClient(cookieAdapter);

  const { data: video, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !video) {
    return notFound();
  }

  const { data: subtopicRows } = await supabase
    .from('subtopics')
    .select('*')
    .eq('video_id', id)
    .order('order_index', { ascending: true });

  const subtopics: SubtopicData[] = (subtopicRows || []).map((st: any) => ({
    key: st.id,
    name: st.name,
    start_seconds: st.start_seconds,
  }));

  const initialData: VideoFormData & { subtopics: SubtopicData[] } = {
    id: video.id,
    chapter_name: video.chapter_name,
    subject: video.subject,
    title: video.title,
    thumbnail_url: video.thumbnail_url,
    duration_seconds: video.duration_seconds,
    subtopics,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-6">Edit Video</h1>
      <VideoForm initialData={initialData} isEdit />
    </div>
  );
}
