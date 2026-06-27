"use client";

import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosinstance";

import Navbar from "../components/Navbar";

export default function ShortsPage() {

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {

    try {

      const response =
        await axiosInstance.get("/video");

      setVideos(response.data.result);

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <>
      <Navbar />

      <div className="bg-black h-[calc(100vh-72px)] overflow-y-scroll snap-y snap-mandatory">

        {videos.map((video) => (

          <div
            key={video._id}
            className="h-screen flex justify-center items-center snap-start"
          >

            <div className="relative w-[360px] h-[640px] rounded-xl overflow-hidden shadow-2xl">

              <video
                src={
                  video.videoUrl ||
                  "/videos/sample.mp4"
                }
                controls
                autoPlay
                loop
                className="w-full h-full object-cover"
              />

              {/* Overlay */}

              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-5 text-white">

                <h2 className="text-xl font-bold">
                  {video.title}
                </h2>

                <p className="text-sm mt-2">
                  {video.channelName}
                </p>

                <p className="text-sm mt-1">
                  👀 {video.views} Views
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </>

  );

}