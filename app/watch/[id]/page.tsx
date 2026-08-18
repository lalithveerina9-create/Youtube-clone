"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axiosInstance from "../../../lib/axiosinstance";
import { useUser } from "../../../lib/AuthContext";
import CustomVideoPlayer from "../../components/CustomVideoPlayer";

export default function WatchPage() {

  const { id } = useParams();
  const { user } = useUser();

  // ==========================
  // STATES
  // ==========================

  const [video, setVideo] = useState<any>(null);
  const [channel, setChannel] = useState<any>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<any[]>([]);

  const [comment, setComment] = useState("");

  const [translatedComments, setTranslatedComments] =
    useState<{ [key: string]: string }>({});

  const [selectedLanguage, setSelectedLanguage] =
    useState<{ [key: string]: string }>({});

  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [premiumRestricted, setPremiumRestricted] =
    useState(false);

  const [watchLimitReached, setWatchLimitReached] =
    useState(false);

  const [isSubscribed, setIsSubscribed] =
    useState(false);

  // Advertisement
  const [showAd, setShowAd] = useState(false);
  const [adSeconds, setAdSeconds] = useState(5);

  // Watch Party
  const [watchPartyLink, setWatchPartyLink] =
    useState("");

  const [showWatchPartyModal,
    setShowWatchPartyModal] =
    useState(false);

  const [creatingParty, setCreatingParty] =
    useState(false);

  // ==========================
  // LOAD PAGE
  // ==========================

  useEffect(() => {

    if (!id) return;

    loadPage();

  }, [id]);

  // ==========================
  // AD LOGIC
  // ==========================

  useEffect(() => {

    if (!user) return;

    if (user.userPlan === "Gold") {
      setShowAd(false);
      return;
    }

    setShowAd(true);
    setAdSeconds(5);

    const interval = setInterval(() => {

      setAdSeconds((prev) => {

        if (prev <= 1) {
          clearInterval(interval);
          setShowAd(false);
          return 0;
        }

        return prev - 1;

      });

    }, 1000);

    return () => clearInterval(interval);

  }, [user?._id, user?.userPlan, id]);

  // ==========================
  // LOAD ALL DATA
  // ==========================

  const loadPage = async () => {

    try {

      setLoading(true);

      await getVideo();
      await getComments();
      await getRecommendedVideos();
      await addToHistory();

    } catch (err) {

      console.error(err);
      setError("Something went wrong.");

    } finally {

      setLoading(false);

    }

  };
  // ==========================
// SAFE IMAGE / VIDEO URL
// ==========================

const safeSrc = (url: string | undefined, fallback: string) => {

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

    const response = await axiosInstance.get(
      `/video/${id}`,
      {
        params: {
          userId: user?._id,
        },
      }
    );

    const videoData = response.data.result;

    setVideo(videoData);

    if (videoData?.channelId) {
      await getChannel(videoData.channelId);
    }

  } catch (error: any) {

    if (
      error.response?.status === 403 &&
      error.response?.data?.premiumRestricted
    ) {

      setPremiumRestricted(true);
      setError("");
      return;

    }

    console.error("Video Load Error:", error);

    setError(
      error.response?.data?.message ||
      "Failed to load video."
    );

  }

};

// ==========================
// GET CHANNEL
// ==========================

const getChannel = async (channelId: string) => {

  try {

    const response = await axiosInstance.get(
      `/channel/${channelId}`
    );

    setChannel(response.data.result);

  } catch (error) {

    console.error(error);
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

    console.error(error);

  }

};

// ==========================
// GET RECOMMENDED VIDEOS
// ==========================

const getRecommendedVideos = async () => {

  try {

    const response = await axiosInstance.get(
      "/video"
    );

    const videos = response.data.result.filter(
      (item: any) => item._id !== id
    );

    setRecommendedVideos(videos);

  } catch (error) {

    console.error(error);

  }

};

// ==========================
// ADD TO HISTORY
// ==========================

const addToHistory = async () => {

  if (!user) return;

  try {

    await axiosInstance.post(
      "/history/create",
      {
        userId: user._id,
        videoId: id,
      }
    );

  } catch (error) {

    console.error(error);

  }

};
// ==========================
// LIKE VIDEO
// ==========================

const handleVideoLike = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  try {

    await axiosInstance.post("/likedvideo/add", {
      userId: user._id,
      videoId: id,
    });

    await axiosInstance.post(`/video/like/${id}`);

    getVideo();

    alert("Video Liked Successfully");

  } catch (error) {

    console.error(error);
    alert("Failed to Like Video");

  }

};

// ==========================
// DISLIKE VIDEO
// ==========================

const handleDislike = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  try {

    await axiosInstance.post(`/video/dislike/${id}`);

    getVideo();

  } catch (error) {

    console.error(error);

  }

};

// ==========================
// WATCH LATER
// ==========================

const handleWatchLater = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  try {

    await axiosInstance.post("/watchlater/add", {
      userId: user._id,
      videoId: id,
    });

    alert("Added to Watch Later");

  } catch (error) {

    console.error(error);

  }

};

// ==========================
// DOWNLOAD VIDEO
// ==========================

const handleDownload = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  try {

    const response = await axiosInstance.post(
      "/download",
      {
        userId: user._id,
        videoId: id,
      }
    );

    if (response.data.success) {

      const downloadUrl =
        response.data.downloadUrl;

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      link.download =
        video?.title || "video";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Video downloaded successfully.");

    }

  } catch (error: any) {

    console.error(error);

    if (error.response?.data?.message) {

      alert(error.response.data.message);

    } else {

      alert("Failed to download video.");

    }

  }

};

// ==========================
// CREATE WATCH PARTY
// ==========================

const handleWatchParty = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  try {

    setCreatingParty(true);

    const response =
      await axiosInstance.post(
        "/watchparty/create",
        {
          hostId: user._id,
          videoId: id,
        }
      );

    setWatchPartyLink(
      response.data.inviteLink
    );

    setShowWatchPartyModal(true);

  } catch (error: any) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to create Watch Party."
    );

  } finally {

    setCreatingParty(false);

  }

};

// ==========================
// SUBSCRIBE / UNSUBSCRIBE
// ==========================

const handleSubscribe = async () => {

  if (!channel) return;

  if (!user?._id) {
    alert("Please login first");
    return;
  }

  const userId = user._id;

  try {

    if (!isSubscribed) {

      await axiosInstance.post(
        `/channel/subscribe/${channel._id}`
      );

      await axiosInstance.post(
        "/subscription/add",
        {
          userId,
          channelId: channel._id,
        }
      );

      setIsSubscribed(true);

    } else {

      await axiosInstance.post(
        `/channel/unsubscribe/${channel._id}`
      );

      await axiosInstance.post(
        "/subscription/remove",
        {
          userId,
          channelId: channel._id,
        }
      );

      setIsSubscribed(false);

    }

    getChannel(channel._id);

  } catch (error) {

    console.error(error);

  }

};
// ==========================
// LIKE COMMENT
// ==========================

const handleCommentLike = async (commentId: string) => {

  try {

    await axiosInstance.put("/comment/like", {
      commentId,
    });

    getComments();

  } catch (error: any) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to like comment."
    );

  }

};

// ==========================
// DISLIKE COMMENT
// ==========================

const handleCommentDislike = async (
  commentId: string
) => {

  try {

    await axiosInstance.put("/comment/dislike", {
      commentId,
    });

    getComments();

  } catch (error: any) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to dislike comment."
    );

  }

};

// ==========================
// REPORT COMMENT
// ==========================

const handleCommentReport = async (
  commentId: string
) => {

  try {

    await axiosInstance.put("/comment/report", {
      commentId,
    });

    getComments();

  } catch (error: any) {

    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to report comment."
    );

  }

};

// ==========================
// POST COMMENT
// ==========================

const handleComment = async () => {

  if (!user) {
    alert("Please login first.");
    return;
  }

  if (!comment.trim()) return;

  try {

    await axiosInstance.post(
      "/comment/create",
      {
        videoId: id,
        userName: user.name,
        comment,
        location,
        showLocation,
      }
    );

    setComment("");

    getComments();

  } catch (error) {

    console.error(error);
    alert("Failed to post comment.");

  }

};

// ==========================
// TRANSLATE COMMENT
// ==========================

const translateComment = async (
  id: string,
  text: string
) => {

  try {

    const response =
      await axiosInstance.post(
        "/translate",
        {
          text,
          target:
            selectedLanguage[id] || "en",
        }
      );

    setTranslatedComments((prev) => ({
      ...prev,
      [id]: response.data.translatedText,
    }));

  } catch (error) {

    console.error(error);
    alert("Translation failed");

  }

};

// ==========================
// WATCH TIME LIMIT
// ==========================

const handleWatchTime = (
  e: React.SyntheticEvent<HTMLVideoElement>
) => {

  const videoElement = e.currentTarget;

  if (!user) return;

  const watchLimits: Record<string, number> = {
    Free: 30 * 60,
    Bronze: 50 * 60,
    Silver: 120 * 60,
  };

  if (user.userPlan === "Gold") {
    return;
  }

  const limit =
    watchLimits[user.userPlan];

  if (
    limit &&
    videoElement.currentTime >= limit
  ) {

    videoElement.pause();
    videoElement.currentTime = limit;

    setWatchLimitReached(true);

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

// ==========================
// PREMIUM RESTRICTION
// ==========================

if (premiumRestricted) {

  return (

    <div className="flex justify-center items-center min-h-screen px-5">

      <div className="max-w-lg w-full border rounded-2xl p-10 shadow-lg text-center">

        <div className="text-6xl mb-5">
          🔒
        </div>

        <h1 className="text-3xl font-bold mb-4">
          Premium Video
        </h1>

        <p className="text-gray-600 mb-3">
          This video is available only for paid subscribers.
        </p>

        <p className="text-gray-500 mb-8">
          Upgrade to Bronze, Silver or Gold
          to unlock premium videos.
        </p>

        <Link
          href="/subscription"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
        >
          Upgrade Plan
        </Link>

      </div>

    </div>

  );

}
// ==========================
// MAIN RETURN
// ==========================

return (
<>

<div className="max-w-7xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

  {/* LEFT SIDE */}

  <div className="lg:col-span-2">

    {/* VIDEO */}

    {showAd ? (

      <div className="w-full aspect-video bg-black rounded-xl flex flex-col justify-center items-center text-white">

        <p className="text-sm text-gray-400 mb-3">
          Advertisement
        </p>

        <h2 className="text-3xl font-bold mb-3">
          Your Ad Here
        </h2>

        <p className="text-gray-300 mb-5">
          Upgrade to Gold for ad-free viewing.
        </p>

        <div className="bg-gray-800 px-4 py-2 rounded-lg">
          Video starts in {adSeconds} seconds
        </div>

      </div>

    ) : (

      <CustomVideoPlayer
        videoUrl={safeSrc(
          video?.videoUrl,
          "/videos/sample.mp4"
        )}
        onTimeUpdate={handleWatchTime}
        nextVideo={recommendedVideos[0]}
      />

    )}

    {/* WATCH LIMIT */}

    {watchLimitReached && (

      <div className="mt-4 border rounded-xl p-6 text-center shadow">

        <div className="text-4xl mb-3">
          ⏱️
        </div>

        <h2 className="text-xl font-bold mb-2">
          Watch Time Limit Reached
        </h2>

        <p className="text-gray-600 mb-2">
          You have reached the watch-time limit for your {user?.userPlan} plan.
        </p>

        <p className="text-gray-500 mb-5">
          Upgrade your subscription to continue watching.
        </p>

        <Link
          href="/subscription"
          className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          Upgrade Plan
        </Link>

      </div>

    )}

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
        onClick={handleVideoLike}
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

      <button
        onClick={handleDownload}
        className="bg-purple-600 text-white px-5 py-2 rounded-lg"
      >
        ⬇️ Download
      </button>

      <button
        onClick={handleWatchParty}
        disabled={creatingParty}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg"
      >
        {creatingParty
          ? "Creating..."
          : "🎉 Watch Party"}
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
            {/* COMMENT INPUT */}

      <div className="mt-5">

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full border rounded-lg p-3 resize-none"
          rows={4}
        />

        <div className="flex flex-wrap gap-3 mt-3">

          <input
            type="text"
            placeholder="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />

          <label className="flex items-center gap-2">

            <input
              type="checkbox"
              checked={showLocation}
              onChange={(e) =>
                setShowLocation(e.target.checked)
              }
            />

            Show Location

          </label>

          <button
            onClick={handleComment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Post Comment
          </button>

        </div>

      </div>

      {/* COMMENTS LIST */}

      <div className="space-y-6 mt-8">

        {comments.length === 0 ? (

          <p className="text-gray-500">
            No comments yet.
          </p>

        ) : (

          comments.map((item: any) => (

            <div
              key={item._id}
              className="border rounded-xl p-5 shadow-sm"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold">

                    {item.userName}

                  </h3>

                  {item.showLocation &&
                    item.location && (

                      <p className="text-xs text-gray-500">

                        📍 {item.location}

                      </p>

                    )}

                </div>

              </div>

              <p className="mt-3">

                {translatedComments[item._id]
                  ? translatedComments[item._id]
                  : item.comment}

              </p>

              {/* TRANSLATION */}

              <div className="flex flex-wrap gap-2 mt-4">

                <select
                  value={
                    selectedLanguage[item._id] ||
                    "en"
                  }
                  onChange={(e) =>
                    setSelectedLanguage((prev) => ({
                      ...prev,
                      [item._id]:
                        e.target.value,
                    }))
                  }
                  className="border rounded px-3 py-1"
                >

                  <option value="en">
                    English
                  </option>

                  <option value="hi">
                    Hindi
                  </option>

                  <option value="te">
                    Telugu
                  </option>

                  <option value="ta">
                    Tamil
                  </option>

                  <option value="kn">
                    Kannada
                  </option>

                  <option value="ml">
                    Malayalam
                  </option>

                  <option value="fr">
                    French
                  </option>

                  <option value="de">
                    German
                  </option>

                </select>

                <button
                  onClick={() =>
                    translateComment(
                      item._id,
                      item.comment
                    )
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded"
                >
                  Translate
                </button>

              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-3 mt-5">

                <button
                  onClick={() =>
                    handleCommentLike(item._id)
                  }
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  👍 {item.likes || 0}
                </button>

                <button
                  onClick={() =>
                    handleCommentDislike(
                      item._id
                    )
                  }
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  👎 {item.dislikes || 0}
                </button>

                <button
                  onClick={() =>
                    handleCommentReport(
                      item._id
                    )
                  }
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  🚩 Report
                </button>

              </div>

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

    <div className="space-y-5">

      {recommendedVideos.map((item: any) => (

        <Link
          key={item._id}
          href={`/watch/${item._id}`}
          className="flex gap-3 hover:bg-gray-100 rounded-xl p-2 transition"
        >

          <img
            src={safeSrc(
              item.thumbnail,
              "/thumbnail/default-thumbnail.jpg"
            )}
            alt={item.title}
            className="w-44 h-24 rounded-lg object-cover"
          />

          <div>

            <h3 className="font-semibold line-clamp-2">
              {item.title}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {item.views || 0} views
            </p>

          </div>

        </Link>

      ))}

    </div>

  </div>

</div>

{/* ===========================
      WATCH PARTY MODAL
=========================== */}

{showWatchPartyModal && (

  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-8 w-[500px] max-w-[90%] shadow-2xl">

      <h2 className="text-2xl font-bold mb-4">
        🎉 Watch Party Created
      </h2>

      <p className="text-gray-600 mb-4">
        Share this invitation link with your friends.
      </p>

      <input
        type="text"
        readOnly
        value={watchPartyLink}
        className="w-full border rounded-lg px-4 py-3"
      />

      <div className="flex gap-3 mt-6">

        <button
          onClick={() => {
            navigator.clipboard.writeText(
              watchPartyLink
            );

            alert("Invite link copied!");
          }}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
        >
          Copy Link
        </button>

        <button
          onClick={() =>
            setShowWatchPartyModal(false)
          }
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
        >
          Close
        </button>

      </div>

    </div>

  </div>

)}

</>

);

}