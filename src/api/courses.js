// src/api/courses.js
import api from "./client";

export async function fetchCourses() {
  const res = await api.get("/courses/");
  return res.data;
}

export async function fetchCourse(courseId) {
  const res = await api.get(`/courses/${courseId}/`);
  return res.data;
}
