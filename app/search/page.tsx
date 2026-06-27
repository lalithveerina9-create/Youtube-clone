"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";

import axiosInstance from "../../lib/axiosinstance";

export default function SearchPage() {

  const searchParams = useSearchParams();

  const keyword = searchParams.get("q");

  const [videos, setVideos] = useState([]);

  useEffect(() => {

    if (keyword) {

      searchVideos();

    }

  }, [keyword]);

  const searchVideos = async () => {

    try {

      const response =
        await axiosInstance.get(
          `/video/search/${keyword}`
        );

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

        <main className="flex-1 p-6">

          <h1 className="text-3xl font-bold mb-8">

            Search Results for

            <span className="text-red-600">
              {" "} "{keyword}"
            </span>

          </h1>

          {videos.length === 0 ? (

            <h2 className="text-gray-500">
              No videos found.
            </h2>

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