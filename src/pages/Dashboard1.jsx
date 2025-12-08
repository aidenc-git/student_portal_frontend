/*Not in use*/
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const resp = await axios.get("http://127.0.0.1:8000/api/videos/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setVideos(resp.data);
      } catch (err) {
        console.error("Error loading videos", err);
        setError("Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  async function handlePlay(videoId) {
    const token = localStorage.getItem("accessToken");
    try {
      const resp = await axios.get(
        `http://127.0.0.1:8000/api/videos/${videoId}/play/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (resp.data && resp.data.video_url) {
        // Open the MinIO (or presigned) URL in a new tab
        window.open(resp.data.video_url, "_blank");
      } else {
        alert("Unable to get video URL");
      }
    } catch (err) {
      console.error("Error fetching video URL", err);
      alert("Error playing video");
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-100">Loading videos...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold">Student Video Portal</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm rounded bg-slate-700 hover:bg-slate-600"
        >
          Logout
        </button>
      </header>

      <main className="p-6 grid gap-4 md:grid-cols-3">
        {videos.map((video) => (
          <div
            key={video.video_id}
            className="rounded-xl border border-slate-800 bg-slate-800/40 p-4 flex flex-col"
          >
            <div className="font-semibold mb-1">{video.title}</div>
            <div className="text-xs text-slate-300 mb-2">
              {video.course_title || "Unassigned course"}
            </div>
            <p className="text-sm text-slate-200 line-clamp-3 flex-1">
              {video.description}
            </p>
            <button
              onClick={() => handlePlay(video.video_id)}
              className="mt-3 inline-flex justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-400"
            >
              Play
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

export default Dashboard;
