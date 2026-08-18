"use client";


import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "../../../lib/axiosinstance";
import socket from "../../../lib/socket";
import CustomVideoPlayer from "../../components/CustomVideoPlayer";
import VideoCall from "../../components/VideoCall";
interface Participant {
  userId: string;
  username?: string;
}

interface WatchPartyRoom {
  roomId: string;
  hostId: string;
  videoId: string;
  participants: Participant[];
  status: string;
}

interface ChatMessage {
  username: string;
  message: string;
  time: string;
}

export default function WatchPartyPage() {

  const { roomId } = useParams();

  const [room, setRoom] =
  useState<WatchPartyRoom | null>(null);

const [video, setVideo] =
  useState<any>(null);

const [loading, setLoading] =
  useState(true);

  const [error, setError] =
    useState("");

  // ==========================
  // CHAT
  // ==========================

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState("");

  const chatRef =
    useRef<HTMLDivElement>(null);

  // ==========================
  // GET ROOM
  // ==========================

  const getRoom = async () => {

    try {

      const response =
        await axiosInstance.get(
          `/watchparty/${roomId}`
        );

      setRoom(response.data.room);

    } catch (error: any) {

      console.error(error);

      setError(
        error.response?.data?.message ||
        "Room not found."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================
// GET VIDEO
// ==========================

const getVideo = async () => {

  try {

    if (!room?.videoId) return;

    const response =
      await axiosInstance.get(
        `/video/${room.videoId}`
      );

    setVideo(response.data.result);

    console.log(
      "🎥 Watch Party Video:",
      response.data.result
    );

  } catch (error: any) {

    console.error(
      "Video Load Error:",
      error
    );

    setError(
      error.response?.data?.message ||
      "Failed to load watch party video."
    );

  }

};
  // ==========================
  // JOIN ROOM
  // ==========================

  const joinRoom = async () => {

    try {

      await axiosInstance.post(
        "/watchparty/join",
        {

          roomId,

          userId: "123",

          username: "Guest User",

        }
      );

      await getRoom();

    } catch (error) {

      console.error(error);

    }

  };

  // ==========================
  // SEND MESSAGE
  // ==========================

  const sendMessage = () => {

    if (!message.trim()) return;

    socket.emit("send-message", {

      roomId,

      username: "Guest User",

      message,

    });

    setMessage("");

  };

  // ==========================
  // LOAD ROOM
  // ==========================

  useEffect(() => {

    if (!roomId) return;

    joinRoom();

  }, [roomId]);


  // ==========================
// LOAD WATCH PARTY VIDEO
// ==========================

useEffect(() => {

  if (!room?.videoId) return;

  getVideo();

}, [room?.videoId]);
  // ==========================
  // SOCKET
  // ==========================

  useEffect(() => {

    if (!roomId) return;

    socket.connect();

    socket.on("connect", () => {

      console.log(
        "🟢 Connected:",
        socket.id
      );

      socket.emit("join-room", {

        roomId,

        username: "Guest User",

      });

    });

    socket.on(
      "participant-joined",
      async () => {

        await getRoom();

      }
    );

    socket.on(
      "receive-message",
      (data: ChatMessage) => {

        setMessages((prev) => [

          ...prev,

          data,

        ]);

      }
    );

    return () => {

      socket.off("participant-joined");

      socket.off("receive-message");

      socket.disconnect();

    };

  }, [roomId]);

  // ==========================
  // AUTO SCROLL CHAT
  // ==========================

  useEffect(() => {

    if (chatRef.current) {

      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;

    }

  }, [messages]);

  // ==========================
  // LOADING
  // ==========================

  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-screen text-xl">

        Loading Watch Party...

      </div>

    );

  }

  // ==========================
// ERROR
// ==========================

// ==========================
// ERROR
// ==========================

if (error) {

  return (

    <div className="flex justify-center items-center min-h-screen text-red-600 text-xl">

      {error}

    </div>

  );

}

return (

  <div className="max-w-6xl mx-auto p-8">

    <h1 className="text-4xl font-bold mb-6">
      🎉 Watch Party
    </h1>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* ==========================
            LEFT PANEL
      ========================== */}

      <div className="lg:col-span-2">
        {/* ==========================
      WATCH PARTY VIDEO
========================== */}

{/* ==========================
      WATCH PARTY VIDEO
========================== */}

<div className="mb-6">

  {video?.videoUrl ? (

    <CustomVideoPlayer
      videoUrl={video.videoUrl}
      watchPartyRoomId={roomId}
    />

  ) : (

    <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center text-white">

      Loading video...

    </div>

  )}

</div>
        {/* ROOM INFO */}

        <div className="border rounded-xl p-6 shadow bg-white">

          <h2 className="text-2xl font-bold mb-5">
            Room Information
          </h2>

          <div className="space-y-4">

            <p>

              <strong>Room ID:</strong>

              <br />

              <span className="text-gray-600">

                {room?.roomId}

              </span>

            </p>

            <p>

              <strong>Host ID:</strong>

              <br />

              <span className="text-gray-600">

                {room?.hostId}

              </span>

            </p>

            <p>

              <strong>Video ID:</strong>

              <br />

              <span className="text-gray-600">

                {room?.videoId}

              </span>

            </p>

            <p>

              <strong>Status:</strong>

              <span className="ml-3 text-green-600 font-semibold">

                {room?.status}

              </span>

            </p>

            <p>

              <strong>Participants:</strong>

              <span className="ml-3">

                {room?.participants.length}

              </span>

            </p>

          </div>

        </div>
{/* ==========================
      VIDEO CALL
========================== */}

<VideoCall roomId={roomId} />
        {/* PARTICIPANTS */}

        <div className="border rounded-xl p-6 shadow mt-6 bg-white">

          <h2 className="text-2xl font-bold mb-5">

            👥 Participants

          </h2>

          <div className="space-y-3">

            {room?.participants.map((participant, index) => (

              <div

                key={index}

                className="flex justify-between items-center border rounded-lg p-3"

              >

                <span>

                  👤 {participant.username || "Unknown User"}

                </span>

                <span className="text-green-600">

                  Online

                </span>

              </div>

            ))}

          </div>

        </div>

      </div>


              {/* ==========================
            RIGHT PANEL
      ========================== */}

      <div>

        <div className="border rounded-xl shadow bg-white">

          <div className="border-b p-4">

            <h2 className="text-2xl font-bold">

              💬 Live Chat

            </h2>

          </div>

          {/* CHAT AREA */}

          <div
            ref={chatRef}
            className="h-[420px] overflow-y-auto p-4 space-y-4 bg-gray-50"
          >

            {messages.length === 0 ? (

              <div className="text-center text-gray-500 mt-20">

                No messages yet...

              </div>

            ) : (

              messages.map((msg, index) => (

                <div
                  key={index}
                  className="border rounded-lg p-3 bg-white shadow-sm"
                >

                  <div className="flex justify-between items-center">

                    <strong className="text-blue-600">

                      {msg.username}

                    </strong>

                    <span className="text-xs text-gray-500">

                      {msg.time}

                    </span>

                  </div>

                  <p className="mt-2 break-words">

                    {msg.message}

                  </p>

                </div>

              ))

            )}

          </div>

          {/* INPUT */}

          <div className="border-t p-4">

            <div className="flex gap-3">

              <input
                type="text"
                value={message}
                placeholder="Type a message..."
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    sendMessage();

                  }

                }}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >

                Send

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>

  </div>

);
}
