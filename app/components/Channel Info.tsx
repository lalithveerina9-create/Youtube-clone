"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosinstance";

export default function ChannelInfo() {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    getChannel();
  }, []);

  const getChannel = async () => {
    try {
      const response = await axiosInstance.get(
        "/channel/123456"
      );

      setChannel(response.data.result);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-between items-center mt-5">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-full bg-gray-300"></div>

        <div>

          <h2 className="font-bold">
            {channel?.channelName}
          </h2>

          <p className="text-gray-500 text-sm">
            Subscribers
          </p>

        </div>

      </div>

      <div className="flex gap-3">

        <button className="bg-red-600 text-white px-4 py-2 rounded-full">
          Subscribe
        </button>

        <Link href="/channel">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-full">
            View Channel
          </button>
        </Link>

      </div>

    </div>
  );
}