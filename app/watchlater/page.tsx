"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Navbar";
import VideoCard from "../components/VideoCard";

import axiosInstance from "../../lib/axiosinstance";

export default function WatchLaterPage() {

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    try {

      const response =
        await axiosInstance.get("/watchlater");

      setVideos(response.data.result);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="p-6 flex-1">

          <h1 className="text-3xl font-bold mb-6">
            Watch Later
          </h1>

          {videos.length === 0 ? (
            <h2>No videos added yet.</h2>
          ) : (
            <div className="grid grid-cols-3 gap-6">

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