"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../lib/axiosinstance";
import { useUser } from "../../lib/AuthContext";

export default function CreateChannel() {
  const { user } = useUser();
  const router = useRouter();

  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [banner, setBanner] = useState("");

  const createChannel = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!channelName || !description) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      await axiosInstance.post("/channel/create", {
        channelName,
        description,
        profilePic,
        banner,
        userId: user._id,
      });

      alert("Channel created successfully!");
      router.push("/upload");
    } catch (error: any) {
      console.error(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to create channel.");
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Create Channel
      </h1>

      <div className="space-y-5">

        <input
          type="text"
          placeholder="Channel Name"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <textarea
          placeholder="Channel Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-3 rounded-lg"
          rows={4}
        />

        <input
          type="text"
          placeholder="Profile Picture URL (optional)"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          placeholder="Banner URL (optional)"
          value={banner}
          onChange={(e) => setBanner(e.target.value)}
          className="w-full border p-3 rounded-lg"
        />

        <button
          onClick={createChannel}
          className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
        >
          Create Channel
        </button>

      </div>

    </div>
  );
}