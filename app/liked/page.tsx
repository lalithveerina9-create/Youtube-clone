"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";

import axiosInstance from "../../lib/axiosinstance";

export default function LikedPage() {

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getLikedVideos();
  }, []);

  const getLikedVideos = async () => {

    try {

      const response = await axiosInstance.get(
        "/likedvideo/123456"
      );

      // Remove null videos
      const likedVideos = response.data.result
        .map((item) => item.videoId)
        .filter((video) => video !== null && video !== undefined);

      setVideos(likedVideos);

    } catch (error) {

      console.log(error);

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

          {videos.length === 0 ? (

            <h2>No liked videos yet.</h2>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {videos
                .filter((video) => video)
                .map((video) => (

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