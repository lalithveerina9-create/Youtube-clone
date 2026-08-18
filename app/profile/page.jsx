"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function ProfilePage() {
  const { user } = useUser();

  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchDownloads = async () => {
      try {
        const response = await axiosInstance.get(
          `/download/${user._id}`
        );

        if (response.data.success) {
          setDownloads(response.data.downloads);
        }
      } catch (error) {
        console.error("Error fetching downloads:", error);
      }
    };

    fetchDownloads();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto p-8">

      {/* Profile Header */}
      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      {/* User Details */}
      <div className="bg-white shadow-md rounded-xl p-6 flex items-center gap-6">

        <img
          src={user?.image || "/avatar/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border object-cover"
        />

        <div>
          <h2 className="text-2xl font-semibold">
            {user?.name}
          </h2>

          <p className="text-gray-600">
            {user?.email}
          </p>

          <p className="text-gray-500">
            Plan : {user?.userPlan}
          </p>
        </div>

      </div>

      {/* Profile Options */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Downloads */}
        <div className="border rounded-lg p-6">

          <h2 className="text-xl font-semibold mb-4">
            📥 Downloads
          </h2>

          {downloads.length > 0 ? (

            downloads.map((download) => (

              <Link
                key={download._id}
                href={`/watch/${download.video._id}`}
              >

                <div className="flex gap-4 border-b py-4 cursor-pointer hover:bg-gray-100 transition">

                  <img
                    src={download.video.thumbnail}
                    alt={download.video.title}
                    className="w-40 h-24 rounded object-cover"
                  />

                  <div>

                    <h3 className="font-semibold text-lg">
                      {download.video.title}
                    </h3>

                    <p className="text-gray-600">
                      {download.video.channel}
                    </p>

                    <p className="text-sm text-gray-500">
                      Downloaded:{" "}
                      {new Date(download.createdAt).toLocaleDateString()}
                    </p>

                  </div>

                </div>

              </Link>

            ))

          ) : (

            <p className="text-gray-500 text-center py-6">
              No downloads available.
            </p>

          )}

        </div>

        {/* Liked Videos */}

        <div className="border rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
          ❤️ Liked Videos
        </div>

        {/* Watch Later */}

        <div className="border rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition">
          🕒 Watch Later
        </div>

      </div>

    </div>
  );
}