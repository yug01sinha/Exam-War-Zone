import { requireAdmin } from '@/lib/admin-guard';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.authorized) {
    return Response.json({ error: admin.error }, { status: admin.status });
  }

  const { supabase } = admin;
  const { id } = await params;

  let body: { video?: any; subtopics?: any[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { video, subtopics } = body;

  if (!video?.chapter_name || !video?.subject) {
    return Response.json(
      { error: 'Missing required fields: chapter_name, subject' },
      { status: 400 }
    );
  }

  // Update video row (not id, title, thumbnail_url, duration_seconds -
  // those come from YouTube metadata)
  const { error: videoError } = await supabase
    .from('videos')
    .update({
      chapter_name: video.chapter_name,
      subject: video.subject,
      // Allow overriding title/thumbnail/duration if explicitly provided
      ...(video.title !== undefined && { title: video.title }),
      ...(video.thumbnail_url !== undefined && { thumbnail_url: video.thumbnail_url }),
      ...(video.duration_seconds !== undefined && { duration_seconds: video.duration_seconds }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (videoError) {
    return Response.json({ error: videoError.message }, { status: 500 });
  }

  // Replace subtopics: delete existing, re-insert
  if (subtopics !== undefined) {
    await supabase.from('subtopics').delete().eq('video_id', id);

    if (subtopics.length > 0) {
      const subtopicRows = subtopics.map((st: any, i: number) => ({
        video_id: id,
        name: st.name,
        start_seconds: st.start_seconds,
        order_index: i,
      }));

      const { error: subError } = await supabase.from('subtopics').insert(subtopicRows);
      if (subError) {
        return Response.json({ error: subError.message }, { status: 500 });
      }
    }
  }

  return Response.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin.authorized) {
    return Response.json({ error: admin.error }, { status: admin.status });
  }

  const { supabase } = admin;
  const { id } = await params;

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';

  // Check for existing progress on this video's subtopics
  // ponytail: naive check — only checks subtopics table references since
  // user_progress/user_video_state tables may not exist yet. Add real check
  // when those tables are built.
  if (!force) {
    // Check if any students have progress by looking for common progress tables
    const progressChecks = [
      supabase.from('user_progress').select('id', { count: 'exact', head: true }).eq('video_id', id),
      supabase.from('user_video_state').select('id', { count: 'exact', head: true }).eq('video_id', id),
    ];

    const results = await Promise.allSettled(progressChecks);
    let progressCount = 0;

    for (const r of results) {
      if (r.status === 'fulfilled' && !r.value.error && r.value.count) {
        progressCount += r.value.count;
      }
    }

    if (progressCount > 0) {
      return Response.json({ hasProgress: true, count: progressCount });
    }
  }

  // Delete video (subtopics cascade via FK)
  const { error } = await supabase.from('videos').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
