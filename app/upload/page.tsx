"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosinstance";

export default function UploadPage() {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");

  const [channel, setChannel] = useState(null);

  useEffect(() => {
    getChannel();
  }, []);

  const getChannel = async () => {

    try {

      const response = await axiosInstance.get(
        "/channel/user/123456"
      );

      setChannel(response.data.result);

    } catch (error) {

      console.log(error);

      alert("Create a channel first.");

    }

  };

  const uploadVideo = async () => {

    if (
      !title ||
      !description ||
      !thumbnailUrl ||
      !videoUrl ||
      !duration
    ) {

      alert("Please fill all fields.");

      return;

    }

    if (!channel) {

      alert("Channel not found.");

      return;

    }

    try {

      await axiosInstance.post(
        "/video/create",
        {

          title,

          description,

          thumbnailUrl,

          videoUrl,

          duration,

          channelId: channel.userId,

          channelName: channel.channelName,

          channelAvatar: channel.profilePic,

        }
      );

      alert("Video Uploaded Successfully");

      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setVideoUrl("");
      setDuration("");

    } catch (error) {

      console.log(error);

      alert("Upload Failed");

    }

  };
    return (

    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Upload Video
      </h1>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Video Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

        <textarea
          placeholder="Video Description"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full border rounded-lg p-3"
          rows={5}
        />

        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnailUrl}
          onChange={(e) =>
            setThumbnailUrl(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail Preview"
            className="w-full h-72 object-cover rounded-xl"
          />
        )}

        <input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) =>
            setVideoUrl(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

        <input
          type="text"
          placeholder="Duration (10:35)"
          value={duration}
          onChange={(e) =>
            setDuration(e.target.value)
          }
          className="w-full border rounded-lg p-3"
        />

        <button
          onClick={uploadVideo}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg w-full"
        >
          Upload Video
        </button>

      </div>

    </div>

  );

}