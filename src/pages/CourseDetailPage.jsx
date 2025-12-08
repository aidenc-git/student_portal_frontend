//List Videos in Course

// src/pages/CourseDetailPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCourse } from "../api/courses";
import { fetchVideosForCourse } from "../api/videos";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse(courseId).then(setCourse).catch(console.error);
    fetchVideosForCourse(courseId).then(setVideos).catch(console.error);
  }, [courseId]);

  if (!course) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-slate-600 mt-2">{course.description}</p>
      </div>

      <h2 className="text-lg font-semibold mt-4">Videos</h2>
      <div className="space-y-3">
        {videos.map((v) => (
          <div
            key={v.video_id}
            className="bg-white rounded-lg shadow p-3 flex items-center justify-between hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/videos/${v.video_id}`)}
          >
            <div>
              <h3 className="font-medium">{v.title}</h3>
              <p className="text-xs text-slate-500">
                Difficulty: {v.difficulty_level || "N/A"} • Duration:{" "}
                {v.duration ? `${v.duration} sec` : "N/A"}
              </p>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <p className="text-sm text-slate-500">
            No videos available for this course yet.
          </p>
        )}
      </div>
    </div>
  );
}
