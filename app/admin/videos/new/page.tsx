import VideoForm from '../components/VideoForm';

export default function NewVideoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--ink)] mb-6">Add Video</h1>
      <VideoForm />
    </div>
  );
}
