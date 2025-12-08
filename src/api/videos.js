// src/api/videos.js
import api from "./client";

export async function fetchVideosForCourse(courseId) {
  const res = await api.get("/videos/", { params: { course: courseId } });
  return res.data;
}

export async function fetchVideo(videoId) {
  const res = await api.get(`/videos/${videoId}/`);
  return res.data;
}

export async function fetchVideos() {
  const res = await api.get("/api/videos/");
  return res.data; // should be an array of videos
}

export async function updateVideoProgress(videoId, lastSecond, completed) {
  return api.post("/progress/", {
    video: videoId,
    last_watched_second: lastSecond,
    completed,
  });
}

