'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VideoRow } from '../page';

const SUBJECTS = ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function VideoTable({ videos }: { videos: VideoRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const filtered = videos.filter((v) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || v.title.toLowerCase().includes(q) || v.chapter_name.toLowerCase().includes(q);
    const matchesSubject = !subjectFilter || v.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by title or chapter..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)] placeholder-[var(--faint)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo)]"
        />
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm text-[var(--ink)]"
        >
          <option value="">All Subjects</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--tint)] text-left">
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider w-24">
                Thumbnail
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider">
                Chapter
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider">
                Subject
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--muted)] text-xs uppercase tracking-wider">
                Subtopics
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--faint)]">
                  {videos.length === 0 ? 'No videos yet. Add your first video.' : 'No videos match your filters.'}
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => router.push(`/admin/videos/${v.id}/edit`)}
                  className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--tint)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    {v.thumbnail_url ? (
                      <img
                        src={v.thumbnail_url}
                        alt=""
                        className="w-20 h-auto rounded aspect-video object-cover bg-[var(--border)]"
                      />
                    ) : (
                      <div className="w-20 aspect-video rounded bg-[var(--border)] flex items-center justify-center text-[var(--faint)] text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--ink)]">{v.chapter_name}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{v.subject}</td>
                  <td className="px-4 py-3 text-[var(--ink)] max-w-xs truncate">{v.title}</td>
                  <td className="px-4 py-3 text-[var(--muted)] font-mono text-xs">
                    {formatDuration(v.duration_seconds)}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{v.subtopic_count}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
