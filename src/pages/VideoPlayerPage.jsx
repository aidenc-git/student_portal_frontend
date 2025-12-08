//Progress Tracker

// src/pages/VideoPlayerPage.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchVideo, updateVideoProgress } from "../api/videos";

export default function VideoPlayerPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchVideo(videoId).then(setVideo).catch(console.error);
  }, [videoId]);

  // periodically send progress to backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && video) {
        const current = Math.floor(videoRef.current.currentTime);
        const total = Math.floor(videoRef.current.duration || 0);
        const completed = total > 0 && current >= total - 5;

        updateVideoProgress(video.video_id, current, completed).catch(
          console.error
        );
      }
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [video]);

  if (!video) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{video.title}</h1>
      <p className="text-slate-600">{video.description}</p>

      <div className="bg-black rounded-xl overflow-hidden shadow">
        <video
          ref={videoRef}
          className="w-full"
          controls
          src={video.file_url}
        />
      </div>
    </div>
  );
}
