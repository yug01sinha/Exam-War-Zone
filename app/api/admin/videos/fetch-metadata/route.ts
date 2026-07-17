import { requireAdmin } from '@/lib/admin-guard';

function extractYouTubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/,
  ];
  for (const p of patterns) {
    const match = input.trim().match(p);
    if (match) return match[1] || match[0];
  }
  return null;
}

function parseDuration(iso8601: string): number {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || '0', 10);
  const m = parseInt(match[2] || '0', 10);
  const s = parseInt(match[3] || '0', 10);
  return h * 3600 + m * 60 + s;
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin.authorized) {
    return Response.json({ error: admin.error }, { status: admin.status });
  }

  let body: { input?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.input?.trim()) {
    return Response.json({ error: 'Missing input' }, { status: 400 });
  }

  const videoId = extractYouTubeId(body.input);
  if (!videoId) {
    return Response.json({ error: 'Could not extract YouTube video ID from input' }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`;

  const ytRes = await fetch(url);
  if (!ytRes.ok) {
    return Response.json({ error: 'YouTube API request failed' }, { status: 502 });
  }

  const data = await ytRes.json() as any;
  const item = data.items?.[0];
  if (!item) {
    return Response.json({ error: 'Video not found on YouTube' }, { status: 404 });
  }

  const snippet = item.snippet;
  const contentDetails = item.contentDetails;

  return Response.json({
    id: videoId,
    title: snippet.title || '',
    thumbnail_url: snippet.thumbnails?.maxres?.url
      || snippet.thumbnails?.high?.url
      || snippet.thumbnails?.medium?.url
      || snippet.thumbnails?.default?.url
      || '',
    duration_seconds: parseDuration(contentDetails.duration || 'PT0S'),
    channel: snippet.channelTitle || '',
  });
}
