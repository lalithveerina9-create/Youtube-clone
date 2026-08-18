"use client";

import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import axiosInstance from "../../lib/axiosinstance";
import { useUser } from "../../lib/AuthContext";

export default function SubscriptionPage() {
  const { user } = useUser();

  const [channels, setChannels] = useState([]);

  useEffect(() => {
    if (user?._id) {
      getSubscriptions();
    }
  }, [user]);

  const getSubscriptions = async () => {
    try {
      const response = await axiosInstance.get(
        `/subscription/${user._id}`
      );

      const subscribedChannels = response.data.result.map(
        (item) => item.channelId
      );

      setChannels(subscribedChannels);
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
            Subscriptions
          </h1>

          {channels.length === 0 ? (
            <div className="text-center mt-20">
              <h2 className="text-2xl font-semibold">
                No Subscriptions
              </h2>

              <p className="text-gray-500 mt-2">
                Subscribe to your favorite channels.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <div
                  key={channel._id}
                  className="border rounded-xl p-5 shadow hover:shadow-lg transition"
                >
                  <img
                    src={
                      channel.profilePic ||
                      "/avatar/default-avatar.png"
                    }
                    alt="Channel"
                    className="w-24 h-24 rounded-full mx-auto object-cover"
                  />

                  <h2 className="text-xl font-bold text-center mt-4">
                    {channel.channelName}
                  </h2>

                  <p className="text-center text-gray-500 mt-2">
                    {channel.description}
                  </p>

                  <p className="text-center text-gray-500 mt-3">
                    👥 {channel.subscribers} Subscribers
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}