// src/pages/Dashboard.jsx
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function Dashboard() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [videos, setVideos] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
 
  async function loadVideos(autoSelect = false) {
    const token = localStorage.getItem("accessToken");
    const params = {};

    if (search.trim()) params.q = search.trim();
    // Don't filter by course when searching - we want all matching videos
    else if (selectedCourseId) params.course_id = selectedCourseId;

    const url = search.trim()
      ? `${API_BASE}/api/videos/search/`
      : `${API_BASE}/api/videos/`;

    const res = await axios.get(url, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });

    // search endpoint returns {results: []}, list endpoint returns []
    const data = Array.isArray(res.data) ? res.data : res.data.results;
    setVideos(data);

    // Auto-select course and video when search returns results
    if (autoSelect && data.length > 0) {
      const firstVideo = data[0];
      
      // Auto-select the course of the first matched video
      setSelectedCourseId(firstVideo.course_id);
      
      // Auto-play the first matched video
      await handlePlay(firstVideo);
    }
  }

  // Load videos when course selection changes (but not on search)
  useEffect(() => {
    if (!search.trim()) {
      loadVideos(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        navigate("/")
        return
      }

      try {
        setLoading(true)

        // Load courses and videos in parallel
        const [coursesRes, videosRes] = await Promise.all([
          axios.get(`${API_BASE}/api/courses/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/videos/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const courseData = coursesRes.data || []
        const videoData = videosRes.data || []

        setCourses(courseData)
        setVideos(videoData)

        // Default selection: first course + its first video (if any)
        if (courseData.length > 0) {
          const firstCourseId = courseData[0].course_id
          setSelectedCourseId(firstCourseId)

          const firstCourseVideos = videoData.filter(
            (v) => v.course_id === firstCourseId
          )
          if (firstCourseVideos.length > 0) {
            setSelectedVideo(firstCourseVideos[0])
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err)
        setErrorMsg("Failed to load courses or videos")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  async function handlePlay(video) {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      navigate("/")
      return
    }

    try {
      const res = await axios.get(`${API_BASE}/api/videos/${video.video_id}/play/`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Play API response:", res.data)

      if (res.data && res.data.url) {
        setCurrentVideoUrl(res.data.url)
        setSelectedVideo(video)
      } else {
        alert("Unable to get Video URL")
      }
    } catch (err) {
      console.error("Error fetching video URL:", err)
      alert("Unable to get Video URL")
    }
  }

  function handleLogout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    navigate("/")
  }

  
  const selectedCourse = courses.find(
    (c) => c.course_id === selectedCourseId
  )

  const courseVideos = selectedCourseId
    ? videos.filter((v) => v.course_id === selectedCourseId)
    : []

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950">
        {/* Left title */}
        <h1 className="text-lg font-semibold tracking-tight">Student Video Portal</h1>

        <div className="flex items-center gap-3">
          <input
            className="w-72 rounded-lg border px-3 py-2 text-sm"
            placeholder="Search videos (title, transcript, tags...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                loadVideos(true);
              }
            }}
          />
          <button
            className="rounded-lg bg-black px-4 py-2 text-sm text-white"
            onClick={() => loadVideos(true)}
          >
            Search
          </button>
          <button
            className="rounded-lg border px-4 py-2 text-sm"
            onClick={() => {
              setSearch("");
              // Reset to show all videos without auto-selecting
              if (selectedCourseId) {
                loadVideos(false);
              }
            }}
          >
            Clear
          </button>
        </div>

        {/* Right section: Logo + Company Name + Logout */}
        <div className="flex items-center gap-4">
          
          {/* Company Branding */}
          <div className="flex items-center gap-2">
            <img
              src="/A2-Logo.PNG"  // <--- place logo.png inside: student_portal_frontend/public/
              alt="Company Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-sm font-medium text-slate-200">
              A<sup>2</sup> Learning Platform
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm"
          >
            Logout
          </button>
        </div>

      </header>

      {/* Main layout: left courses / right content */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: Courses list */}
        <aside className="w-72 border-r border-slate-800 bg-slate-950/80 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Courses
            </h2>
          </div>

          {loading && (
            <p className="p-4 text-sm text-slate-500">Loading courses...</p>
          )}

          {errorMsg && (
            <p className="p-4 text-sm text-red-400">{errorMsg}</p>
          )}

          <div className="flex-1 overflow-y-auto">
            <ul className="p-3 space-y-2">
              {courses.map((course) => (
                <li key={course.course_id}>
                  <button
                    onClick={() => {
                      if (course.course_id !== selectedCourseId) {
                        setSelectedCourseId(course.course_id)
                        setSelectedVideo(null)
                        setCurrentVideoUrl(null)
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md border text-sm transition 
                      ${
                        course.course_id === selectedCourseId
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {course.title || "Untitled course"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        ID: {course.course_id}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-400">
                      {course.category && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {course.category}
                        </span>
                      )}
                      {course.level && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          Level: {course.level}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* RIGHT: Course details + videos + player */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Course info */}
          <div className="border-b border-slate-800 px-6 py-4">
            {selectedCourse ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Course #{selectedCourse.course_id}
                    </p>
                    <h2 className="text-xl font-semibold">
                      {selectedCourse.title}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedCourse.category && (
                      <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900">
                        Category: {selectedCourse.category}
                      </span>
                    )}
                    {selectedCourse.level && (
                      <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900">
                        Level: {selectedCourse.level}
                      </span>
                    )}
                  </div>
                </div>
                {selectedCourse.description && (
                  <p className="mt-2 text-sm text-slate-300 max-w-3xl">
                    {selectedCourse.description}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-slate-400">
                Select a course from the left to view its videos.
              </p>
            )}
          </div>

          {/* Split: video list / player */}
          <div className="flex-1 flex min-h-0">
            {/* Video list */}
            <section className="w-80 border-r border-slate-800 bg-slate-950/60 flex flex-col">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-200">
                  Videos
                </h3>
                <span className="text-[11px] text-slate-500">
                  {courseVideos.length} item
                  {courseVideos.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto">
                {courseVideos.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500">
                    No videos in this course yet.
                  </p>
                ) : (
                  <ul className="p-3 space-y-2">
                    {courseVideos.map((video) => (
                      <li key={video.video_id}>
                        <button
                          onClick={() => handlePlay(video)}
                          className={`w-full text-left px-3 py-2 rounded-md border text-sm transition ${
                            selectedVideo &&
                            selectedVideo.video_id === video.video_id
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-slate-800 bg-slate-900 hover:bg-slate-900/80"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium truncate">
                              {video.title || "Untitled video"}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              ID: {video.video_id}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-400">
                            {video.duration != null && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                                Duration: {video.duration} sec
                              </span>
                            )}
                            {video.difficulty_level && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800">
                                Level: {video.difficulty_level}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Player & video details */}
            <section className="flex-1 flex flex-col min-w-0 bg-slate-950">
              <div className="px-6 py-4 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-slate-200">
                  Now Playing
                </h3>
                {selectedVideo ? (
                  <div className="mt-2 text-sm text-slate-300 space-y-1">
                    <p className="font-medium text-base">
                      {selectedVideo.title}
                    </p>
                    {selectedVideo.description && (
                      <p className="text-slate-400 max-w-3xl">
                        {selectedVideo.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs mt-1">
                      <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900">
                        Course ID: {selectedVideo.course_id}
                      </span>
                      {selectedVideo.difficulty_level && (
                        <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900">
                          Video Level: {selectedVideo.difficulty_level}
                        </span>
                      )}
                      {selectedVideo.duration != null && (
                        <span className="px-2 py-1 rounded-full border border-slate-700 bg-slate-900">
                          Duration: {selectedVideo.duration} sec
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Choose a video from the list to start watching.
                  </p>
                )}
              </div>

              {/* Smaller video area */}
              <div className="flex-1 flex justify-center p-4 overflow-auto">
                {currentVideoUrl ? (
                  <div className="w-full max-w-3xl">
                    <div className="relative w-full aspect-video rounded-lg border border-slate-800 bg-black overflow-hidden">
                      <video
                        key={currentVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                      >
                        <source src={currentVideoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 self-center">
                    No video is currently playing.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}