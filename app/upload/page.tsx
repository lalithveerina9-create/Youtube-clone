"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosinstance";
import { useUser } from "../../lib/AuthContext";

interface Channel {
  _id: string;
  userId: string;
  channelName: string;
  profilePic: string;
}

export default function UploadPage() {
  const { user } = useUser();

  const [channel, setChannel] = useState<Channel | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      getChannel();
    }
  }, [user]);

  const getChannel = async () => {
    try {
      const response = await axiosInstance.get(`/channel/user/${user?._id}`);
      setChannel(response.data.result);
    } catch (error) {
      alert("Please create a channel first.");
    }
  };

  const uploadVideo = async () => {
    if (
      !title ||
      !description ||
      !thumbnailUrl ||
      !videoFile ||
      !duration
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (!channel) {
      alert("Please create a channel first.");
      return;
    }

    try {
      setUploading(true);

      // Upload video to Cloudinary
      const formData = new FormData();
      formData.append("video", videoFile);

      const uploadResponse = await axiosInstance.post(
        "/video/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const videoUrl = uploadResponse.data.videoUrl;

      // Save details in MongoDB
      await axiosInstance.post("/video/create", {
        title,
        description,
        thumbnailUrl,
        videoUrl,
        duration,
        channelId: channel._id,
        channelName: channel.channelName,
        channelAvatar: channel.profilePic,
      });

      alert("Video uploaded successfully!");

      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setVideoFile(null);
      setDuration("");
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.error ||
          "Failed to upload video."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Video Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-full h-72 object-cover rounded-lg border"
          />
        )}

        <div>
          <label className="block mb-2 font-medium">
            Select Video
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setVideoFile(e.target.files[0]);
              }
            }}
            className="block w-full text-sm text-gray-700
            file:mr-4
            file:py-2
            file:px-4
            file:rounded-lg
            file:border-0
            file:bg-red-600
            file:text-white
            hover:file:bg-red-700
            file:cursor-pointer"
          />

          {videoFile && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {videoFile.name}
            </p>
          )}
        </div>

        <input
          type="text"
          placeholder="Duration (e.g. 10:35)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={uploadVideo}
          disabled={!channel || uploading}
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-3 disabled:bg-gray-400"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>

      </div>
    </div>
  );
}