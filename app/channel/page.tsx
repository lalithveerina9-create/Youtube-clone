"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosinstance";
import VideoCard from "../components/VideoCard";

export default function ChannelPage() {

  const USER_ID = "123456";

 const [channel, setChannel] = useState<any>(null);
 const [videos, setVideos] = useState<any[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    getChannel();
    getVideos();
  }, []);

  const getChannel = async () => {
    try {

      const response = await axiosInstance.get(
        `/channel/${USER_ID}`
      );

      setChannel(response.data.result);

    } catch (error) {
      console.log(error);
    }
  };

  const getVideos = async () => {
    try {

      const response = await axiosInstance.get(
        `/video/channel/${USER_ID}`
      );

      setVideos(response.data.result);

    } catch (error) {
      console.log(error);
    }
  };

  const handleSubscribe = async () => {

    try {

      if (!channel) return;

      if (!isSubscribed) {

        await axiosInstance.post(
          "/subscription/add",
          {
            userId: USER_ID,
            channelId: channel._id,
          }
        );

        setIsSubscribed(true);

      } else {

        await axiosInstance.post(
          "/subscription/remove",
          {
            userId: USER_ID,
            channelId: channel._id,
          }
        );

        setIsSubscribed(false);

      }

      getChannel();

    } catch (error) {
      console.log(error);
    }

  };

  return (
    <div className="p-6">

      {/* Banner */}
      <img
        src={
          channel?.banner ||
          "/banner/default-banner.jpg"
        }
        alt="Banner"
        className="w-full h-60 object-cover rounded-xl"
      />

      {/* Channel Info */}
      <div className="flex justify-between items-center mt-8">

        <div className="flex gap-6 items-center">

          <img
            src={
              channel?.profilePic ||
              "/avatar/default-avatar.png"
            }
            alt="Avatar"
            className="w-28 h-28 rounded-full object-cover border"
          />

          <div>

            <h1 className="text-4xl font-bold">
              {channel?.channelName}
            </h1>

            <p className="text-gray-500 mt-2">
              {channel?.description}
            </p>

            <p className="text-gray-500 mt-2">
              👥 {channel?.subscribers || 0} Subscribers
            </p>

          </div>

        </div>

        <button
          onClick={handleSubscribe}
          className={`px-8 py-3 rounded-full font-semibold text-white transition ${
            isSubscribed
              ? "bg-gray-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isSubscribed
            ? "✓ Subscribed"
            : "Subscribe"}
        </button>

      </div>

      {/* Videos */}
      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-6">
          Videos
        </h2>

        {videos.length === 0 ? (

          <h3 className="text-gray-500">
            No Videos Uploaded Yet
          </h3>

        ) : (

          <div className="grid grid-cols-3 gap-6">

            {videos.map((video: any) => (

              <VideoCard
                key={video._id}
                video={video}
              />

            ))}

          </div>

        )}

      </div>

    </div>
  );
}