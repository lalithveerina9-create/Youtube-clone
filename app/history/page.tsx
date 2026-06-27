"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import axiosInstance from "../../lib/axiosinstance";

export default function HistoryPage() {

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getHistory();
  }, []);

  const getHistory = async () => {

    try {

      const response = await axiosInstance.get(
        "/history/123456"
      );

      // Remove null videos
      const historyVideos = response.data.result
        .map((item) => item.videoId)
        .filter((video) => video);

      // Remove duplicate videos
      const uniqueVideos = Array.from(
        new Map(
          historyVideos.map((video) => [video._id, video])
        ).values()
      );

      setVideos(uniqueVideos);

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

          <h1 className="text-3xl font-bold mb-8">
            Watch History
          </h1>

          {videos.length === 0 ? (

            <div className="text-center mt-20">

              <h2 className="text-2xl font-semibold">
                No History Found
              </h2>

              <p className="text-gray-500 mt-2">
                Watch some videos to build your history.
              </p>

            </div>

          ) : (

            <div className="space-y-6">

              {videos.map((video) => (

                <Link
                  key={video._id}
                  href={`/watch/${video._id}`}
                >

                  <div className="flex gap-5 border rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer">

                    <img
                      src={
                        video.thumbnailUrl ||
                        "/thumbnails/default.jpg"
                      }
                      alt={video.title}
                      className="w-72 h-40 rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <h2 className="text-2xl font-bold">
                        {video.title}
                      </h2>

                      <p className="text-gray-500 mt-2">
                        {video.channelName}
                      </p>

                      <p className="text-gray-500">
                        👀 {video.views} views
                      </p>

                      <p className="mt-4 text-gray-700 line-clamp-3">
                        {video.description}
                      </p>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </main>

      </div>

    </>

  );

}