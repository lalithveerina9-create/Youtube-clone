"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function ProfilePage() {
  const { user } = useUser();

  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return;
    }

    const fetchDownloads = async () => {
      try {
        const response = await axiosInstance.get(
          `/download/${user._id}`
        );

        if (response.data.success) {
          setDownloads(response.data.downloads || []);
        }
      } catch (error) {
        console.error("Error fetching downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user]);

  const validDownloads = downloads.filter(
    (download) => download && download.video
  );

  return (
    <div className="max-w-5xl mx-auto p-8">

      {/* Profile Header */}
      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      {/* User Details */}
      <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-6">

        <img
          src={
            user?.image ||
            "/avatar/default-avatar.png"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full border object-cover"
        />

        <div>

          <h2 className="text-2xl font-semibold">
            {user?.name || "User"}
          </h2>

          <p className="text-gray-600">
            {user?.email || ""}
          </p>

          {/* Subscription */}
          <div className="mt-2 flex items-center gap-2">

            <span className="text-gray-500">
              Subscription:
            </span>

            <span className="font-semibold text-red-600">
              {user?.userPlan || "Free"}
            </span>

          </div>

          {/* Manage Subscription */}
          <Link
            href="/subscription"
            className="inline-block mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            Manage Subscription
          </Link>

        </div>

      </div>

      {/* Profile Options */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* DOWNLOADS */}
        <div className="border rounded-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            📥 Downloads
          </h2>

          {loading ? (

            <p className="text-gray-500">
              Loading downloads...
            </p>

          ) : validDownloads.length > 0 ? (

            validDownloads.map((download) => (

              <Link
                key={download._id}
                href={`/watch/${download.video._id}`}
                className="block mb-4"
              >

                <div className="flex items-center gap-3">

                  <img
                    src={
                      download.video.thumbnailUrl ||
                      "/thumbnail/default-thumbnail.jpg"
                    }
                    alt={
                      download.video.title ||
                      "Video"
                    }
                    className="w-24 h-14 object-cover rounded"
                  />

                  <div className="min-w-0">

                    <p className="font-medium truncate">
                      {download.video.title ||
                        "Untitled Video"}
                    </p>

                    <p className="text-sm text-gray-500 truncate">
                      {download.video.channelName || ""}
                    </p>

                  </div>

                </div>

              </Link>

            ))

          ) : (

            <p className="text-gray-500">
              No downloaded videos yet.
            </p>

          )}

        </div>

        {/* LIKED VIDEOS */}
        <div className="border rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">

          <h2 className="text-xl font-semibold mb-2">
            ❤️ Liked Videos
          </h2>

          <p className="text-gray-500">
            View your liked videos
          </p>

        </div>

        {/* WATCH LATER */}
        <Link
          href="/watchlater"
          className="border rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition"
        >

          <h2 className="text-xl font-semibold mb-2">
            🕒 Watch Later
          </h2>

          <p className="text-gray-500">
            View videos saved for later
          </p>

        </Link>

      </div>

    </div>
  );
}