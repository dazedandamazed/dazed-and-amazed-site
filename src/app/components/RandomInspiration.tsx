import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useVideoArchive } from "../hooks/useVideoArchive";

export function RandomInspiration() {
  const navigate = useNavigate();
  const { videos, loading } = useVideoArchive();

  useEffect(() => {
    if (loading) return;

    const randomIndex = Math.floor(Math.random() * videos.length);
    const randomVideo = videos[randomIndex];

    if (!randomVideo) {
      navigate("/", { replace: true });
      return;
    }

    navigate(`/video/${randomVideo.id}`, { replace: true });
  }, [loading, navigate, videos]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <p className="text-white">Loading random inspiration...</p>
      </div>
    </div>
  );
}
