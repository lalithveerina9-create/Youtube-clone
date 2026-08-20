"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";

import axiosInstance from "../../lib/axiosinstance";
import { useUser } from "../../lib/AuthContext";

export default function LikedPage() {
  const { user } = useUser();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    getLikedVideos();
  }, [user?._id]);

  const getLikedVideos = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/likedvideo/${user._id}`
      );

      const likedVideos = (response.data.result || [])
        .map((item) => item.videoId)
        .filter((video) => video);

      setVideos(likedVideos);
    } catch (error) {
      console.error("Error fetching liked videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">

          <h1 className="text-3xl font-bold mb-6">
            Liked Videos
          </h1>

          {!user ? (
            <h2>Please login to see your liked videos.</h2>
          ) : loading ? (
            <h2>Loading liked videos...</h2>
          ) : videos.length === 0 ? (
            <h2>No liked videos yet.</h2>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                />
              ))}

            </div>
          )}

        </main>
      </div>
    </>
  );
}