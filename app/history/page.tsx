"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import axiosInstance from "../../lib/axiosinstance";
import { useUser } from "../../lib/AuthContext";

export default function HistoryPage() {
  const { user } = useUser();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    getHistory();
  }, [user]);

  const getHistory = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(
        `/history/${user._id}`
      );

      if (response.data.success) {
        // Get videos from history
        const historyVideos = (response.data.result || [])
          .map((item) => item.videoId)
          .filter((video) => video);

        // Remove duplicate videos
        const uniqueVideos = Array.from(
          new Map(
            historyVideos.map((video) => [
              video._id,
              video,
            ])
          ).values()
        );

        setVideos(uniqueVideos);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
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

          <h1 className="text-3xl font-bold mb-8">
            Watch History
          </h1>

          {/* Loading */}
          {loading ? (

            <div className="text-center mt-20">

              <p className="text-gray-500">
                Loading history...
              </p>

            </div>

          ) : videos.length === 0 ? (

            /* No History */
            <div className="text-center mt-20">

              <h2 className="text-2xl font-semibold">
                No History Found
              </h2>

              <p className="text-gray-500 mt-2">
                Watch some videos to build your history.
              </p>

            </div>

          ) : (

            /* History Videos */
            <div className="space-y-6">

              {videos.map((video) => (

                <Link
                  key={video._id}
                  href={`/watch/${video._id}`}
                  className="block"
                >

                  <div className="flex gap-5 border rounded-xl p-4 hover:bg-gray-100 transition cursor-pointer">

                    {/* Thumbnail */}
                    <img
                      src={
                        video.thumbnailUrl ||
                        "/thumbnails/default.jpg"
                      }
                      alt={video.title || "Video"}
                      className="w-72 h-40 rounded-xl object-cover"
                    />

                    {/* Video Details */}
                    <div className="flex-1">

                      <h2 className="text-2xl font-bold">
                        {video.title || "Untitled Video"}
                      </h2>

                      <p className="text-gray-500 mt-2">
                        {video.channelName || ""}
                      </p>

                      <p className="text-gray-500">
                        👀 {video.views || 0} views
                      </p>

                      <p className="mt-4 text-gray-700 line-clamp-3">
                        {video.description || ""}
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