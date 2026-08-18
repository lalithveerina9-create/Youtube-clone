"use client";

import { useEffect, useRef, useState } from "react";
import socket from "../../lib/socket";

export default function VideoCall({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  // Recording
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);

  // ==========================
  // START CAMERA
  // ==========================

  const startCamera = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCameraOn(true);
      setMicOn(true);

      createPeerConnection();
    } catch (error) {
      console.error(
        "Camera/Microphone error:",
        error
      );
    }
  };

  // ==========================
  // CREATE PEER CONNECTION
  // ==========================

  const createPeerConnection = () => {
    if (peerConnection.current) {
      return peerConnection.current;
    }

    const pc =
      new RTCPeerConnection({
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      });

    peerConnection.current = pc;

    // ==========================
    // ADD LOCAL TRACKS
    // ==========================

    if (localStream.current) {
      localStream.current
        .getTracks()
        .forEach((track) => {
          pc.addTrack(
            track,
            localStream.current
          );
        });
    }

    // ==========================
    // REMOTE STREAM
    // ==========================

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          event.streams[0];

        setConnected(true);
      }
    };

    // ==========================
    // ICE CANDIDATES
    // ==========================

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit(
          "webrtc-ice-candidate",
          {
            roomId,
            candidate: event.candidate,
          }
        );
      }
    };

    return pc;
  };

  // ==========================
  // SOCKET SIGNALING
  // ==========================

  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "join-video-call",
      {
        roomId,
      }
    );

    // ==========================
    // USER JOINED
    // ==========================

    const handleUserJoined = async () => {
      console.log(
        "📹 Another user joined video call"
      );

      const pc =
        createPeerConnection();

      const offer =
        await pc.createOffer();

      await pc.setLocalDescription(
        offer
      );

      socket.emit(
        "webrtc-offer",
        {
          roomId,
          offer,
        }
      );
    };

    // ==========================
    // RECEIVE OFFER
    // ==========================

    const handleOffer = async ({
      offer,
    }) => {
      console.log(
        "📥 WebRTC offer received"
      );

      const pc =
        createPeerConnection();

      await pc.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer =
        await pc.createAnswer();

      await pc.setLocalDescription(
        answer
      );

      socket.emit(
        "webrtc-answer",
        {
          roomId,
          answer,
        }
      );
    };

    // ==========================
    // RECEIVE ANSWER
    // ==========================

    const handleAnswer = async ({
      answer,
    }) => {
      console.log(
        "📥 WebRTC answer received"
      );

      const pc =
        peerConnection.current;

      if (!pc) return;

      await pc.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    };

    // ==========================
    // ICE CANDIDATE
    // ==========================

    const handleIceCandidate = async ({
      candidate,
    }) => {
      const pc =
        peerConnection.current;

      if (!pc) return;

      try {
        await pc.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        console.error(
          "ICE candidate error:",
          error
        );
      }
    };

    // ==========================
    // PARTICIPANT LEFT
    // ==========================

    const handleUserLeft = () => {
      console.log(
        "📞 Participant left the call"
      );

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          null;
      }

      setConnected(false);
    };

    // ==========================
    // SOCKET EVENTS
    // ==========================

    socket.on(
      "video-call-user-joined",
      handleUserJoined
    );

    socket.on(
      "webrtc-offer",
      handleOffer
    );

    socket.on(
      "webrtc-answer",
      handleAnswer
    );

    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate
    );

    socket.on(
      "video-call-user-left",
      handleUserLeft
    );

    // ==========================
    // CLEANUP
    // ==========================

    return () => {
      socket.off(
        "video-call-user-joined",
        handleUserJoined
      );

      socket.off(
        "webrtc-offer",
        handleOffer
      );

      socket.off(
        "webrtc-answer",
        handleAnswer
      );

      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate
      );

      socket.off(
        "video-call-user-left",
        handleUserLeft
      );
    };
  }, [roomId]);

  // ==========================
  // TOGGLE CAMERA
  // ==========================

  const toggleCamera = () => {
    if (!localStream.current) return;

    const videoTrack =
      localStream.current.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled =
      !videoTrack.enabled;

    setCameraOn(
      videoTrack.enabled
    );
  };

  // ==========================
  // TOGGLE MICROPHONE
  // ==========================

  const toggleMic = () => {
    if (!localStream.current) return;

    const audioTrack =
      localStream.current.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled =
      !audioTrack.enabled;

    setMicOn(
      audioTrack.enabled
    );
  };

  // ==========================
  // STOP SCREEN SHARE
  // ==========================

  const stopScreenShare = async () => {
    if (!peerConnection.current) {
      return;
    }

    try {
      if (!localStream.current) {
        return;
      }

      const cameraTrack =
        localStream.current.getVideoTracks()[0];

      const sender =
        peerConnection.current
          .getSenders()
          .find(
            (sender) =>
              sender.track &&
              sender.track.kind === "video"
          );

      if (sender && cameraTrack) {
        await sender.replaceTrack(
          cameraTrack
        );
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          localStream.current;
      }

      setScreenSharing(false);
    } catch (error) {
      console.error(
        "Stop screen sharing error:",
        error
      );
    }
  };

  // ==========================
  // SCREEN SHARING
  // ==========================

  const toggleScreenShare = async () => {
    if (!peerConnection.current) {
      console.log(
        "Peer connection not available"
      );
      return;
    }

    try {
      if (!screenSharing) {
        const screenStream =
          await navigator.mediaDevices.getDisplayMedia(
            {
              video: true,
            }
          );

        const screenTrack =
          screenStream.getVideoTracks()[0];

        const sender =
          peerConnection.current
            .getSenders()
            .find(
              (sender) =>
                sender.track &&
                sender.track.kind === "video"
            );

        if (sender) {
          await sender.replaceTrack(
            screenTrack
          );
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            screenStream;
        }

        setScreenSharing(true);

        screenTrack.onended = async () => {
          await stopScreenShare();
        };
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error(
        "Screen sharing error:",
        error
      );
    }
  };

  // ==========================
  // START RECORDING
  // ==========================

  const startRecording = () => {
    if (!localStream.current) {
      console.log(
        "No camera stream available"
      );
      return;
    }

    try {
      recordedChunks.current = [];

      let options = {};

      // Check supported recording format
      if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp9,opus"
        )
      ) {
        options = {
          mimeType:
            "video/webm;codecs=vp9,opus",
        };
      } else if (
        MediaRecorder.isTypeSupported(
          "video/webm;codecs=vp8,opus"
        )
      ) {
        options = {
          mimeType:
            "video/webm;codecs=vp8,opus",
        };
      } else {
        options = {
          mimeType: "video/webm",
        };
      }

      const recorder =
        new MediaRecorder(
          localStream.current,
          options
        );

      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const blob =
          new Blob(
            recordedChunks.current,
            {
              type: "video/webm",
            }
          );

        const url =
          URL.createObjectURL(blob);

        const link =
          document.createElement("a");

        link.href = url;

        link.download =
          `watch-party-${roomId}.webm`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        recordedChunks.current = [];
      };

      recorder.onerror = (event) => {
        console.error(
          "MediaRecorder error:",
          event
        );

        setRecording(false);
      };

      recorder.start();

      setRecording(true);

      console.log(
        "🔴 Recording started"
      );
    } catch (error) {
      console.error(
        "Recording error:",
        error
      );
    }
  };

  // ==========================
  // STOP RECORDING
  // ==========================

  const stopRecording = () => {
    if (
      mediaRecorder.current &&
      mediaRecorder.current.state !==
        "inactive"
    ) {
      mediaRecorder.current.stop();

      setRecording(false);

      console.log(
        "⏹️ Recording stopped"
      );
    }
  };

  // ==========================
  // LEAVE CALL
  // ==========================

  const leaveCall = () => {
    console.log(
      "📞 Leaving video call"
    );

    // Stop recording first
    if (
      mediaRecorder.current &&
      mediaRecorder.current.state !==
        "inactive"
    ) {
      mediaRecorder.current.stop();
    }

    // Stop camera and microphone
    if (localStream.current) {
      localStream.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      localStream.current = null;
    }

    // Close WebRTC connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Clear local video
    if (localVideoRef.current) {
      localVideoRef.current.srcObject =
        null;
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject =
        null;
    }

    setCameraOn(false);
    setMicOn(false);
    setConnected(false);
    setScreenSharing(false);
    setRecording(false);

    socket.emit(
      "leave-video-call",
      {
        roomId,
      }
    );
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div className="border rounded-xl p-6 shadow bg-white mt-6">

      <h2 className="text-2xl font-bold mb-4">
        📹 Video Call
      </h2>

      {/* ==========================
            VIDEO AREA
      ========================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* LOCAL VIDEO */}

        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {!cameraOn && !screenSharing && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Camera Off
            </div>
          )}

          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded">
            You
          </div>

        </div>

        {/* REMOTE VIDEO */}

        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!connected && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Waiting for participant...
            </div>
          )}

          {connected && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded">
              Participant
            </div>
          )}

        </div>

      </div>

      {/* ==========================
            CONTROLS
      ========================== */}

      <div className="flex flex-wrap gap-3 mt-5">

        {!cameraOn && !localStream.current ? (

          <button
            onClick={startCamera}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            📹 Join Video Call
          </button>

        ) : (

          <>

            {/* CAMERA */}

            <button
              onClick={toggleCamera}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
            >
              {cameraOn
                ? "📹 Camera Off"
                : "📹 Camera On"}
            </button>

            {/* MICROPHONE */}

            <button
              onClick={toggleMic}
              className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg"
            >
              {micOn
                ? "🎤 Mute"
                : "🔇 Unmute"}
            </button>

            {/* SCREEN SHARE */}

            <button
              onClick={toggleScreenShare}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg"
            >
              {screenSharing
                ? "🛑 Stop Sharing"
                : "🖥️ Share Screen"}
            </button>

            {/* RECORDING */}

            <button
              onClick={
                recording
                  ? stopRecording
                  : startRecording
              }
              className={
                recording
                  ? "bg-red-700 hover:bg-red-800 text-white px-5 py-2 rounded-lg"
                  : "bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
              }
            >
              {recording
                ? "⏹️ Stop Recording"
                : "🔴 Start Recording"}
            </button>

            {/* LEAVE */}

            <button
              onClick={leaveCall}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg"
            >
              📞 Leave Call
            </button>

          </>

        )}

      </div>

    </div>
  );
}