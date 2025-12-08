import { useState } from "react";
import { api } from "../api/client";

export default function UploadVideo() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const upload = async () => {
    const form = new FormData();
    form.append("file", file);
    form.append("title", title);
    form.append("uploaded_by", 1); // test user
    form.append("course", 1); // test course

    const res = await api.post("/videos/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    console.log("Uploaded:", res.data);
    alert("Upload successful!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Upload Video</h1>

      <input type="text" placeholder="Title"
        className="border p-2"
        onChange={(e) => setTitle(e.target.value)} />

      <input type="file"
        className="block mt-3"
        onChange={(e) => setFile(e.target.files[0])} />

      <button
        onClick={upload}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
}
