"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import VideoCard from "./components/VideoCard";
import IntroAnimation from "./components/IntroAnimation";
import axiosInstance from "../lib/axiosinstance";

export default function Home() {

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    getVideos();
  }, []);

  const getVideos = async () => {
    try {

      const response = await axiosInstance.get("/video");

      setVideos(response.data.result);

    } catch (error) {

      console.log(error);

    }
  };

  return (
    <>

      {/* Intro Animation */}
      <IntroAnimation />

      {/* Navbar */}
      <Navbar />

      <div className="flex">

        <Sidebar />

        <main className="p-6 flex-1">

          <div className="grid grid-cols-3 gap-6">

            {videos.map((video) => (

              <VideoCard
                key={video._id}
                video={video}
              />

            ))}

          </div>

        </main>

      </div>

    </>
  );

}