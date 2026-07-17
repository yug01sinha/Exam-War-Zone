import { requireAdmin } from '@/lib/admin-guard';

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.authorized) {
    return Response.json({ error: admin.error }, { status: admin.status });
  }

  const { supabase } = admin;

  let body: { video?: any; subtopics?: any[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { video, subtopics = [] } = body;

  if (!video?.id || !video?.chapter_name || !video?.subject) {
    return Response.json(
      { error: 'Missing required fields: id, chapter_name, subject' },
      { status: 400 }
    );
  }

  // Insert video
  const { error: videoError } = await supabase.from('videos').insert({
    id: video.id,
    chapter_name: video.chapter_name,
    subject: video.subject,
    title: video.title || '',
    thumbnail_url: video.thumbnail_url || '',
    duration_seconds: video.duration_seconds || 0,
  });

  if (videoError) {
    return Response.json({ error: videoError.message }, { status: 500 });
  }

  // Bulk insert subtopics
  if (subtopics.length > 0) {
    const subtopicRows = subtopics.map((st: any, i: number) => ({
      video_id: video.id,
      name: st.name,
      start_seconds: st.start_seconds,
      order_index: i,
    }));

    const { error: subError } = await supabase.from('subtopics').insert(subtopicRows);

    if (subError) {
      // Rollback: delete the video we just inserted
      await supabase.from('videos').delete().eq('id', video.id);
      return Response.json({ error: subError.message }, { status: 500 });
    }
  }

  return Response.json({ success: true, id: video.id }, { status: 201 });
}
