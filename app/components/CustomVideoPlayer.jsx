"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "../../lib/socket";

export default function CustomVideoPlayer({
  videoUrl,
  onTimeUpdate,
  nextVideo,
  watchPartyRoomId,
}) {
  const router = useRouter();

  const videoRef = useRef(null);
  const hideControlsTimeout = useRef(null);
  const lastTap = useRef(0);

  // Prevent Socket.IO events from being sent back again
  const isRemoteAction = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [showSkip, setShowSkip] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);

  // ==========================
  // PLAY / PAUSE
  // ==========================

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {

      video.play();

      setPlaying(true);

      resetControlsTimer();

      // Send play event to Watch Party
      if (watchPartyRoomId && !isRemoteAction.current) {

        socket.emit("play-video", watchPartyRoomId);

      }

    } else {

      video.pause();

      setPlaying(false);

      setShowControls(true);

      // Send pause event to Watch Party
      if (watchPartyRoomId && !isRemoteAction.current) {

        socket.emit("pause-video", watchPartyRoomId);

      }

    }
  };

  // ==========================
  // VIDEO LOADED
  // ==========================

  const handleLoadedMetadata = () => {

    if (!videoRef.current) return;

    setDuration(videoRef.current.duration);

  };

  // ==========================
  // TIME UPDATE
  // ==========================

  const handleVideoTimeUpdate = (e) => {

    if (!videoRef.current) return;

    setCurrentTime(videoRef.current.currentTime);

    if (onTimeUpdate) {

      onTimeUpdate(e);

    }

  };

  // ==========================
// SEEK
// ==========================

const handleSeek = (e) => {

  const value = Number(e.target.value);

  if (!videoRef.current) return;

  videoRef.current.currentTime = value;

  setCurrentTime(value);

  // Send seek position to Watch Party
  if (
    watchPartyRoomId &&
    !isRemoteAction.current
  ) {

    socket.emit("seek-video", {
      roomId: watchPartyRoomId,
      currentTime: value,
    });

  }

};

  // ==========================
  // VOLUME
  // ==========================

  const handleVolume = (e) => {

    const value = Number(e.target.value);

    if (!videoRef.current) return;

    videoRef.current.volume = value;

    setVolume(value);

  };

  // ==========================
  // FULLSCREEN
  // ==========================

  const handleFullscreen = () => {

    if (
      videoRef.current &&
      videoRef.current.requestFullscreen
    ) {

      videoRef.current.requestFullscreen();

    }

  };

  // ==========================
  // SKIP FORWARD
  // ==========================

  const skipForward = () => {

    if (!videoRef.current) return;

    const newTime = Math.min(
      videoRef.current.currentTime + 10,
      duration
    );

    videoRef.current.currentTime = newTime;

    setCurrentTime(newTime);

  };

  // ==========================
  // SKIP BACKWARD
  // ==========================

  const skipBackward = () => {

    if (!videoRef.current) return;

    const newTime = Math.max(
      videoRef.current.currentTime - 10,
      0
    );

    videoRef.current.currentTime = newTime;

    setCurrentTime(newTime);

  };

  // ==========================
  // DOUBLE TAP
  // ==========================

  const handleDoubleTap = (e) => {

    const now = Date.now();

    if (now - lastTap.current < 300) {

      const rect =
        e.currentTarget.getBoundingClientRect();

      const tapX =
        e.clientX - rect.left;

      if (tapX < rect.width / 2) {

        skipBackward();

        setShowSkip("back");

      } else {

        skipForward();

        setShowSkip("forward");

      }

      setTimeout(() => {

        setShowSkip("");

      }, 600);

    }

    lastTap.current = now;

  };

  // ==========================
  // FORMAT TIME
  // ==========================

  const formatTime = (time) => {

    if (isNaN(time)) return "00:00";

    const minutes = Math.floor(time / 60);

    const seconds = Math.floor(time % 60);

    return `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

  };

  // ==========================
  // AUTO HIDE CONTROLS
  // ==========================

  const resetControlsTimer = () => {

    setShowControls(true);

    if (hideControlsTimeout.current) {

      clearTimeout(
        hideControlsTimeout.current
      );

    }

    hideControlsTimeout.current =
      setTimeout(() => {

        if (!videoRef.current?.paused) {

          setShowControls(false);

        }

      }, 3000);

  };

  // ==================================================
  // WATCH PARTY SOCKET EVENTS
  // ==================================================

  useEffect(() => {

    if (!watchPartyRoomId) return;

    // Make sure Socket.IO is connected
    if (!socket.connected) {

      socket.connect();

    }

    // --------------------------
    // REMOTE PLAY
    // --------------------------

    const handleRemotePlay = () => {

      const video = videoRef.current;

      if (!video) return;

      isRemoteAction.current = true;

      video
        .play()
        .catch((error) => {

          console.error(
            "Remote play failed:",
            error
          );

        });

      setPlaying(true);

      setTimeout(() => {

        isRemoteAction.current = false;

      }, 100);

    };

    // --------------------------
    // REMOTE PAUSE
    // --------------------------

    const handleRemotePause = () => {

      const video = videoRef.current;

      if (!video) return;

      isRemoteAction.current = true;

      video.pause();

      setPlaying(false);

      setTimeout(() => {

        isRemoteAction.current = false;

      }, 100);

    };

    // --------------------------
// REMOTE SEEK
// --------------------------

const handleRemoteSeek = ({
  currentTime,
}) => {

  const video = videoRef.current;

  if (!video) return;

  isRemoteAction.current = true;

  video.currentTime = currentTime;

  setCurrentTime(currentTime);

  setTimeout(() => {

    isRemoteAction.current = false;

  }, 100);

};

   socket.on(
  "play-video",
  handleRemotePlay
);

socket.on(
  "seek-video",
  handleRemoteSeek
);

socket.on(
  "pause-video",
  handleRemotePause
);

    return () => {

      socket.off(
        "play-video",
        handleRemotePlay
      );

      socket.off(
        "pause-video",
        handleRemoteSeek
      );

      socket.off(
        "seek-video",
        handleRemotePause
      );

    };

  }, [watchPartyRoomId]);

  // ==========================
  // CLEANUP
  // ==========================

  useEffect(() => {

    return () => {

      if (hideControlsTimeout.current) {

        clearTimeout(
          hideControlsTimeout.current
        );

      }

    };

  }, []);

  // ==========================
  // UI
  // ==========================

  return (

    <div
      className="relative w-full bg-black rounded-xl overflow-hidden"
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => {

        if (!videoRef.current?.paused) {

          setShowControls(false);

        }

      }}
    >

      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full cursor-pointer"
        controls={false}

        onLoadedMetadata={
          handleLoadedMetadata
        }

        onTimeUpdate={
          handleVideoTimeUpdate
        }

        onWaiting={() =>
          setLoading(true)
        }

        onPlaying={() => {

          setLoading(false);

          setPlaying(true);

          resetControlsTimer();

        }}

        onPause={() =>
          setPlaying(false)
        }

        onEnded={() => {

          setVideoEnded(true);

          setPlaying(false);

        }}

        onPointerDown={
          handleDoubleTap
        }
      />

      {/* SKIP BACKWARD */}

      {showSkip === "back" && (

        <div className="absolute inset-0 flex items-center justify-start pl-12 pointer-events-none">

          <div className="bg-black/70 text-white px-6 py-4 rounded-full text-2xl animate-pulse">

            ⏪ 10s

          </div>

        </div>

      )}

      {/* SKIP FORWARD */}

      {showSkip === "forward" && (

        <div className="absolute inset-0 flex items-center justify-end pr-12 pointer-events-none">

          <div className="bg-black/70 text-white px-6 py-4 rounded-full text-2xl animate-pulse">

            10s ⏩

          </div>

        </div>

      )}

      {/* LOADING */}

      {loading && (

        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">

          Loading...

        </div>

      )}

      {/* VIDEO ENDED */}

      {videoEnded && (

        <div className="absolute inset-0 bg-black/80 flex flex-col justify-center items-center gap-5 z-50">

          <h2 className="text-white text-3xl font-bold">

            Video Finished

          </h2>

          <button
            onClick={() => {

              if (!videoRef.current) return;

              videoRef.current.currentTime = 0;

              videoRef.current.play();

              setPlaying(true);

              setVideoEnded(false);

              resetControlsTimer();

            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
          >

            🔄 Replay

          </button>

          {nextVideo && (

            <button
              onClick={() =>
                router.push(
                  `/watch/${nextVideo._id}`
                )
              }
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
            >

              ▶ Next Video

            </button>

          )}

        </div>

      )}

      {/* CONTROLS */}

      <div
        className={`absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-300 ${
          showControls
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >

        <button
          onClick={skipBackward}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
        >

          ⏪ 10s

        </button>

        <button
          onClick={togglePlay}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >

          {playing ? "Pause" : "Play"}

        </button>

        <button
          onClick={skipForward}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded"
        >

          10s ⏩

        </button>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 accent-red-600"
        />

        <span className="text-white text-sm whitespace-nowrap">

          {formatTime(currentTime)}
          {" / "}
          {formatTime(duration)}

        </span>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          className="accent-red-600"
        />

        <button
          onClick={handleFullscreen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >

          Fullscreen

        </button>

      </div>

    </div>

  );

}