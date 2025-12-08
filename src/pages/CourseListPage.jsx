// src/pages/CourseListPage.jsx
import { useEffect, useState } from "react";
import { fetchCourses } from "../api/courses";
import { useNavigate } from "react-router-dom";

export default function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Available Courses</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div
            key={course.course_id}
            className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate(`/courses/${course.course_id}`)}
          >
            <h2 className="font-semibold text-lg mb-1">{course.title}</h2>
            <p className="text-sm text-slate-600 line-clamp-3">
              {course.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
