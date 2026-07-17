'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'];

export type SubtopicData = {
  key: string; // React key, not persisted
  name: string;
  start_seconds: number;
};

export type VideoFormData = {
  id: string;
  chapter_name: string;
  subject: string;
  title: string;
  thumbnail_url: string;
  duration_seconds: number;
};

type Props = {
  initialData?: VideoFormData & { subtopics: SubtopicData[] };
  isEdit?: boolean;
};

function mmssToSeconds(mmss: string): number {
  const parts = mmss.split(':');
  if (parts.length !== 2) return 0;
  const m = parseInt(parts[0], 10) || 0;
  const s = parseInt(parts[1], 10) || 0;
  return m * 60 + s;
}

function secondsToMmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

let subtopicKeyCounter = 0;
function nextKey(): string {
  return `st_${Date.now()}_${subtopicKeyCounter++}`;
}

export default function VideoForm({ initialData, isEdit }: Props) {
  const router = useRouter();
  const [youtubeInput, setYoutubeInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [videoId, setVideoId] = useState(initialData?.id || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail_url || '');
  const [durationSeconds, setDurationSeconds] = useState(initialData?.duration_seconds || 0);
  const [chapterName, setChapterName] = useState(initialData?.chapter_name || '');
  const [subject, setSubject] = useState(initialData?.subject || SUBJECTS[0]);
  const [subtopics, setSubtopics] = useState<SubtopicData[]>(
    initialData?.subtopics?.map((st) => ({ ...st, key: nextKey() })) || []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteState, setDeleteState] = useState<'idle' | 'confirming' | 'deleting'>('idle');
  const [deleteProgressCount, setDeleteProgressCount] = useState(0);

  async function handleFetchMetadata() {
    if (!youtubeInput.trim()) return;
    setFetching(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/admin/videos/fetch-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: youtubeInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch metadata');

      setVideoId(data.id);
      setTitle(data.title);
      setThumbnailUrl(data.thumbnail_url);
      setDurationSeconds(data.duration_seconds);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  }

  function handleRefetchMetadata() {
    handleFetchMetadata();
  }

  function addSubtopic() {
    setSubtopics([...subtopics, { key: nextKey(), name: '', start_seconds: 0 }]);
  }

  function removeSubtopic(key: string) {
    setSubtopics(subtopics.filter((st) => st.key !== key));
  }

  function updateSubtopic(key: string, field: 'name' | 'start_seconds', value: string | number) {
    setSubtopics(
      subtopics.map((st) =>
        st.key === key ? { ...st, [field]: field === 'start_seconds' ? Number(value) : value } : st
      )
    );
  }

  function updateSubtopicTime(key: string, mmss: string) {
    setSubtopics(
      subtopics.map((st) =>
        st.key === key ? { ...st, start_seconds: mmssToSeconds(mmss) } : st
      )
    );
  }

  function moveSubtopic(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= subtopics.length) return;
    const arr = [...subtopics];
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
    setSubtopics(arr);
  }

  async function handleSave() {
    if (!chapterName.trim()) {
      setError('Chapter name is required');
      return;
    }
    if (!videoId) {
      setError('Fetch YouTube metadata first');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      video: {
        id: videoId,
        chapter_name: chapterName.trim(),
        subject,
        title,
        thumbnail_url: thumbnailUrl,
        duration_seconds: durationSeconds,
      },
      subtopics: subtopics.map((st, i) => ({
        name: st.name,
        start_seconds: st.start_seconds,
        order_index: i,
      })),
    };

    try {
      const url = isEdit ? `/api/admin/videos/${videoId}` : '/api/admin/videos';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');

      router.push('/admin/videos');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (deleteState === 'idle') {
      setDeleteState('confirming');
      setError(null);

      // Check for student progress first
      try {
        const res = await fetch(`/api/admin/videos/${videoId}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.hasProgress) {
          setDeleteProgressCount(data.count);
        } else {
          // No progress, proceed directly
          await forceDelete();
          return;
        }
      } catch (err: any) {
        setError(err.message);
        setDeleteState('idle');
      }
    }
  }

  async function forceDelete() {
    setDeleteState('deleting');
    try {
      const res = await fetch(`/api/admin/videos/${videoId}?force=true`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.push('/admin/videos');
    } catch (err: any) {
      setError(err.message);
      setDeleteState('idle');
    }
  }

  return (
    <div className="max-w-2xl">
      {/* YouTube fetch section */}
      <section className="bg-white rounded-lg border border-[var(--border)] p-6 mb-6">
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">YouTube Metadata</h2>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="YouTube URL or video ID"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
          />
          <button
            type="button"
            onClick={handleFetchMetadata}
            disabled={fetching || !youtubeInput.trim()}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--grad)' }}
          >
            {fetching ? 'Fetching...' : 'Fetch Details'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleRefetchMetadata}
              disabled={fetching}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
            >
              Re-fetch
            </button>
          )}
        </div>

        {fetchError && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{fetchError}</p>
        )}

        {videoId && (
          <div className="grid grid-cols-2 gap-4">
            {thumbnailUrl && (
              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Thumbnail</label>
                <img src={thumbnailUrl} alt="" className="w-full max-w-[240px] rounded aspect-video object-cover bg-[var(--border)]" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Title (from YouTube)</label>
              <p className="text-sm text-[var(--ink)]">{title || '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Duration</label>
              <p className="text-sm font-mono text-[var(--ink)]">{secondsToMmss(durationSeconds)}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Video ID</label>
              <p className="text-sm font-mono text-[var(--muted)]">{videoId}</p>
            </div>
          </div>
        )}
      </section>

      {/* Chapter info */}
      <section className="bg-white rounded-lg border border-[var(--border)] p-6 mb-6">
        <h2 className="text-lg font-bold text-[var(--ink)] mb-4">Chapter Info</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Chapter Name</label>
            <input
              type="text"
              value={chapterName}
              onChange={(e) => setChapterName(e.target.value)}
              placeholder="e.g., Quadratic Equations"
              className="w-full px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[var(--ink)] mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)]"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Subtopics editor */}
      <section className="bg-white rounded-lg border border-[var(--border)] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--ink)]">Subtopics</h2>
          <button
            type="button"
            onClick={addSubtopic}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
            style={{ background: 'var(--grad)' }}
          >
            + Add Subtopic
          </button>
        </div>

        {subtopics.length === 0 ? (
          <p className="text-sm text-[var(--faint)] py-4 text-center">
            No subtopics yet. Add timestamps for key moments in the video.
          </p>
        ) : (
          <div className="space-y-2">
            {subtopics.map((st, i) => (
              <div
                key={st.key}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--tint)]"
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveSubtopic(i, -1)}
                    disabled={i === 0}
                    className="w-6 h-5 flex items-center justify-center rounded text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSubtopic(i, 1)}
                    disabled={i === subtopics.length - 1}
                    className="w-6 h-5 flex items-center justify-center rounded text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>

                <span className="text-xs font-mono text-[var(--faint)] w-5">{i + 1}.</span>

                <input
                  type="text"
                  value={st.name}
                  onChange={(e) => updateSubtopic(st.key, 'name', e.target.value)}
                  placeholder="Subtopic name"
                  className="flex-1 px-3 py-1.5 bg-white border border-[var(--border)] rounded text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
                />

                <input
                  type="text"
                  value={secondsToMmss(st.start_seconds)}
                  onChange={(e) => updateSubtopicTime(st.key, e.target.value)}
                  placeholder="00:00"
                  className="w-20 px-3 py-1.5 bg-white border border-[var(--border)] rounded text-sm font-mono text-[var(--ink)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
                />

                <button
                  type="button"
                  onClick={() => removeSubtopic(st.key)}
                  className="w-7 h-7 flex items-center justify-center rounded text-[var(--faint)] hover:text-[var(--red)] hover:bg-red-50 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Error display */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">{error}</p>
      )}

      {/* Delete confirmation */}
      {deleteState === 'confirming' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-red-700 mb-3">
            {deleteProgressCount > 0
              ? `${deleteProgressCount} students have progress on this chapter. Delete anyway?`
              : 'Delete this video and all its subtopics?'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={forceDelete}
              disabled={false}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              Yes, Delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteState('idle')}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--grad)' }}
          >
            {saving ? 'Saving...' : isEdit ? 'Update Video' : 'Create Video'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/videos')}
            className="px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
          >
            Cancel
          </button>
        </div>

        {isEdit && deleteState === 'idle' && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Delete Video
          </button>
        )}
      </div>
    </div>
  );
}
