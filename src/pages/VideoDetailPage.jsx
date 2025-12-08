import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function VideoDetailPage() {
  const { id } = useParams();  // video_id from the URL
  const [video, setVideo] = useState(null);
  const [playUrl, setPlayUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }

    // 1) Load video metadata
    axios
      .get(`http://127.0.0.1:8000/api/videos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setVideo(res.data))
      .catch(() => setError("Failed to load video details"));

    // 2) Get presigned play URL
    axios
      .get(`http://127.0.0.1:8000/api/videos/${id}/play/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPlayUrl(res.data.url))
      .catch(() => setError("Failed to get video URL from storage"));
  }, [id, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="bg-slate-900/80 border border-red-500 rounded-xl p-6 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Error</p>
          <p className="text-sm text-slate-200 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-sky-600 rounded-lg text-sm font-medium hover:bg-sky-500"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p className="text-slate-400">Loading video...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-sky-400 hover:text-sky-300"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
        <p className="text-sm text-slate-400 mb-4">
          {video.course_title ? `Course: ${video.course_title}` : "General video"}
        </p>
        <p className="text-sm text-slate-300 mb-6">{video.description}</p>

        {playUrl ? (
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800">
            <video
              src={playUrl}
              controls
              className="w-full h-full"
              controlsList="nodownload"
            />
          </div>
        ) : (
          <p className="text-slate-400">Preparing video link...</p>
        )}
      </div>
    </div>
  );
}

export default VideoDetailPage;
