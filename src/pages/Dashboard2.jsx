/*Not in use*/
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/videos/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideos(res.data);
      } catch (err) {
        console.error("Failed to load videos", err);
        setErrorMsg("Failed to load videos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [navigate]);

  async function handlePlay(videoId) {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await axios.get(`${API_BASE}/videos/${videoId}/play/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Play API response:", res.data); // <-- helpful debug

      if (res.data && res.data.url) {
        setCurrentVideoUrl(res.data.url);
      } else {
        alert("Unable to get Video URL");
      }
    } catch (err) {
      console.error("Error fetching video URL:", err);
      alert("Unable to get Video URL");
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h1 className="text-xl font-semibold">Student Video Portal</h1>
        <button
          onClick={handleLogout}
          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sm"
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-6">
        <section>
          <h2 className="text-lg font-semibold mb-3">Videos</h2>
          {loading && <p>Loading...</p>}
          {errorMsg && <p className="text-red-400">{errorMsg}</p>}
          <ul className="space-y-3">
            {videos.map((v) => (
              <li
                key={v.video_id}
                className="flex items-center justify-between px-3 py-2 rounded bg-slate-900 border border-slate-800"
              >
                <div>
                  <p className="font-medium">{v.title}</p>
                  <p className="text-xs text-slate-400">
                    {v.course_title || "No course"}
                  </p>
                </div>
                <button
                  onClick={() => handlePlay(v.video_id)}
                  className="px-3 py-1 text-sm rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                >
                  Play
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Now Playing</h2>
          {currentVideoUrl ? (
            <video
              key={currentVideoUrl} // force reload when URL changes
              controls
              className="w-full rounded-lg border border-slate-800 bg-black"
            >
              <source src={currentVideoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <p className="text-slate-400 text-sm">
              Select a video from the list to start watching.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
