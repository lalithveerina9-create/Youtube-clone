"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "../../../lib/axiosinstance";

export default function WatchPage() {

  const { id } = useParams();
const router = useRouter();
  const USER_ID = "123456";

  const [video, setVideo] = useState(null);
  const [channel, setChannel] = useState(null);
  const [comments, setComments] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {

    if (!id) return;

    loadPage();

  }, [id]);

  const loadPage = async () => {

    try {

      setLoading(true);

      await getVideo();
      await getComments();
      await getRecommendedVideos();
      await addToHistory();

    } catch (err) {

      console.log(err);
      setError("Something went wrong.");

    } finally {

      setLoading(false);

    }

  };

  // ==========================
  // SAFE IMAGE / VIDEO URL
  // ==========================
  const safeSrc = (url, fallback) => {

    if (!url || url.trim() === "") {
      return fallback;
    }

    return url;

  };
    // ==========================
  // GET VIDEO
  // ==========================
  const getVideo = async () => {

    try {

      const response = await axiosInstance.get(`/video/${id}`);

      const videoData = response.data.result;

      setVideo(videoData);

      if (videoData?.channelId) {
        await getChannel(videoData.channelId);
      }

    } catch (error) {

      console.log(error);
      setError("Failed to load video.");

    }

  };

// GET CHANNEL
// ==========================
const getChannel = async (channelId) => {

  try {

    const response = await axiosInstance.get(
      `/channel/user/${channelId}`
    );

    setChannel(response.data.result);

  } catch (error) {

    console.log(error);
    setError("Failed to load channel.");

  }

};

  // ==========================
  // GET COMMENTS
  // ==========================
  const getComments = async () => {

    try {

      const response = await axiosInstance.get(
        `/comment/${id}`
      );

      setComments(response.data.result || []);

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================
  // GET RECOMMENDED VIDEOS
  // ==========================
  const getRecommendedVideos = async () => {

    try {

      const response = await axiosInstance.get("/video");

      const videos = response.data.result.filter(
        (item) => item._id !== id
      );

      setRecommendedVideos(videos);

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================
  // ADD TO HISTORY
  // ==========================
  const addToHistory = async () => {

    try {

      await axiosInstance.post(
        "/history/create",
        {
          userId: USER_ID,
          videoId: id,
        }
      );

    } catch (error) {

      console.log(error);

    }

  };
    // ==========================
  // LIKE VIDEO
  // ==========================
  const handleLike = async () => {

  try {

    await axiosInstance.post(
      "/likedvideo/add",
      {
        userId: USER_ID,
        videoId: id,
      }
    );

    // Update like count on the video
    await axiosInstance.post(
      `/video/like/${id}`
    );

    getVideo();

    alert("Video Liked Successfully");

  } catch (error) {

    console.log(error);

    alert("Failed to Like Video");

  }

};

  // ==========================
  // DISLIKE VIDEO
  // ==========================
  const handleDislike = async () => {

    try {

      await axiosInstance.post(
        `/video/dislike/${id}`
      );

      getVideo();

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================
  // WATCH LATER
  // ==========================
  const handleWatchLater = async () => {

    try {

      await axiosInstance.post(
        "/watchlater/add",
        {
          userId: USER_ID,
          videoId: id,
        }
      );

      alert("Added to Watch Later");

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================
  // SUBSCRIBE
  // ==========================
  const handleSubscribe = async () => {

    if (!channel) return;

    try {

      if (!isSubscribed) {

        await axiosInstance.post(
          `/channel/subscribe/${channel._id}`
        );

        setIsSubscribed(true);

      } else {

        await axiosInstance.post(
          `/channel/unsubscribe/${channel._id}`
        );

        setIsSubscribed(false);

      }

      getChannel(channel.userId);

    } catch (error) {

      console.log(error);

    }

  };

  // ==========================
  // POST COMMENT
  // ==========================
  const handleComment = async () => {

    if (!comment.trim()) return;

    try {

      await axiosInstance.post(
        "/comment/create",
        {

          videoId: id,

          userName: "Pawan",

          comment,

        }
      );

      setComment("");

      getComments();

    } catch (error) {

      console.log(error);

    }

  };
    // ==========================
  // LOADING
  // ==========================
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Loading...
      </div>
    );
  }

  // ==========================
  // ERROR
  // ==========================
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600 text-xl">
        {error}
      </div>
    );
  }

  return (

    <div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT SIDE */}

      <div className="lg:col-span-2">

        {/* VIDEO */}

        <video
          controls
          className="w-full rounded-xl bg-black"
          src={safeSrc(video?.videoUrl, "/videos/sample.mp4")}
        />

        {/* TITLE */}

        <h1 className="text-2xl font-bold mt-5">
          {video?.title}
        </h1>

        <p className="text-gray-500 mt-2">
          {video?.views || 0} views
        </p>

        {/* CHANNEL */}

        <div className="flex justify-between items-center mt-6 border-b pb-5">

          <div className="flex items-center gap-4">

            <img
              src={safeSrc(
                channel?.profilePic,
                "/avatar/default-avatar.png"
              )}
              alt="Channel"
              className="w-14 h-14 rounded-full object-cover"
            />

            <div>

              <h2 className="font-bold text-lg">
                {channel?.channelName}
              </h2>

              <p className="text-gray-500">
                {channel?.subscribers || 0} Subscribers
              </p>

            </div>

          </div>

          <button
            onClick={handleSubscribe}
            className={`px-6 py-2 rounded-full text-white ${
              isSubscribed
                ? "bg-gray-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </button>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex flex-wrap gap-4 mt-6">

          <button
            onClick={handleLike}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            👍 Like ({video?.likes || 0})
          </button>

          <button
            onClick={handleDislike}
            className="bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            👎 Dislike ({video?.dislikes || 0})
          </button>

          <button
            onClick={handleWatchLater}
            className="bg-green-600 text-white px-5 py-2 rounded-lg"
          >
            ⭐ Watch Later
          </button>

        </div>

        {/* DESCRIPTION */}

        <div className="mt-6 bg-gray-100 rounded-xl p-5">

          <h3 className="font-semibold">
            Description
          </h3>

          <p className="mt-2 whitespace-pre-wrap">
            {video?.description}
          </p>

        </div>

        {/* COMMENTS */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold mb-4">
            Comments
          </h2>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded-lg p-3"
            rows={4}
          />

          <button
            onClick={handleComment}
            className="mt-4 bg-black text-white px-6 py-2 rounded-lg"
          >
            Post Comment
          </button>

          <div className="mt-8">

            {comments.length === 0 ? (

              <p className="text-gray-500">
                No comments yet.
              </p>

            ) : (

              comments.map((item) => (

                <div
                  key={item._id}
                  className="border rounded-lg p-4 mb-4"
                >

                  <h3 className="font-bold">
                    {item.userName}
                  </h3>

                  <p className="mt-2">
                    {item.comment}
                  </p>

                </div>

              ))

            )}

          </div>

        </div>

      </div>
            {/* RIGHT SIDE */}
      <div>

        <h2 className="text-xl font-bold mb-5">
          Recommended Videos
        </h2>

        {recommendedVideos.length === 0 ? (

          <p className="text-gray-500">
            No recommended videos.
          </p>

        ) : (

          recommendedVideos.map((item) => (

            <Link
              key={item._id}
              href={`/watch/${item._id}`}
            >

              <div className="flex gap-3 mb-5 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition">

                {/* Thumbnail */}

                <img
                  src={safeSrc(
                    item.thumbnailUrl,
                    "/thumbnails/default.jpg"
                  )}
                  alt={item.title}
                  className="w-44 h-24 rounded-lg object-cover flex-shrink-0"
                />

                <div className="flex-1">

                  <h3 className="font-semibold line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.channelName || "Unknown Channel"}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.views || 0} views
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.duration || "0:00"}
                  </p>

                </div>

              </div>

            </Link>

          ))

        )}

      </div>

    </div>

  );

}