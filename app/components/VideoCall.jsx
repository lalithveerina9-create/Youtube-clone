
"use client";

import { useEffect, useRef, useState } from "react";
import socket from "../../lib/socket";

export default function VideoCall({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  // Store ICE candidates that arrive before remote description
  const pendingIceCandidates = useRef([]);

  // Recording
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [connected, setConnected] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);

  // ============================================================
  // CREATE PEER CONNECTION
  // ============================================================

  const createPeerConnection = () => {
    // If connection already exists, return it
    if (peerConnection.current) {
      return peerConnection.current;
    }

    console.log("🔗 Creating new WebRTC peer connection");

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peerConnection.current = pc;

    // ==========================================================
    // REMOTE STREAM
    // ==========================================================

    pc.ontrack = (event) => {
      console.log("📥 REMOTE TRACK RECEIVED");

      console.log("Remote streams:", event.streams);

      if (!event.streams || event.streams.length === 0) {
        console.warn("⚠️ Remote track received without stream");
        return;
      }

      const remoteStream = event.streams[0];

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;

        console.log("✅ Remote stream attached to video element");

        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("▶️ Remote video started playing");
          })
          .catch((error) => {
            console.error(
              "❌ Remote video play error:",
              error
            );
          });

        setConnected(true);
      }
    };

    // ==========================================================
    // ICE CANDIDATES
    // ==========================================================

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate");

        socket.emit("webrtc-ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    // ==========================================================
    // CONNECTION STATE
    // ==========================================================

    pc.onconnectionstatechange = () => {
      console.log(
        "🔗 WebRTC connection state:",
        pc.connectionState
      );

      if (pc.connectionState === "connected") {
        console.log("✅ WebRTC connection established");
        setConnected(true);
      }

      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        console.log(
          "❌ WebRTC connection lost:",
          pc.connectionState
        );

        setConnected(false);
      }
    };

    // ==========================================================
    // ICE CONNECTION STATE
    // ==========================================================

    pc.oniceconnectionstatechange = () => {
      console.log(
        "🧊 ICE connection state:",
        pc.iceConnectionState
      );
    };

    // ==========================================================
    // ICE GATHERING STATE
    // ==========================================================

    pc.onicegatheringstatechange = () => {
      console.log(
        "🧊 ICE gathering state:",
        pc.iceGatheringState
      );
    };

    return pc;
  };

  // ============================================================
  // ADD LOCAL TRACKS TO PEER CONNECTION
  // ============================================================

  const addLocalTracks = (pc, stream) => {
    if (!pc || !stream) {
      console.warn(
        "⚠️ Cannot add local tracks: missing peer connection or stream"
      );
      return;
    }

    const existingSenders = pc.getSenders();

    stream.getTracks().forEach((track) => {
      // Prevent duplicate tracks
      const alreadyAdded = existingSenders.some(
        (sender) =>
          sender.track &&
          sender.track.id === track.id
      );

      if (!alreadyAdded) {
        console.log(
          "➕ Adding local track:",
          track.kind
        );

        pc.addTrack(track, stream);
      }
    });
  };

  // ============================================================
  // START CAMERA / JOIN VIDEO CALL
  // ============================================================

  const startCamera = async () => {
    try {
      console.log("📹 Requesting camera and microphone...");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

      console.log("✅ Camera and microphone access granted");

      localStream.current = stream;

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;

        try {
          await localVideoRef.current.play();
        } catch (error) {
          console.warn(
            "Local video autoplay warning:",
            error
          );
        }
      }

      setCameraOn(true);
      setMicOn(true);

      // --------------------------------------------------------
      // IMPORTANT:
      // Create peer connection AFTER camera is available
      // --------------------------------------------------------

      const pc = createPeerConnection();

      // Add camera + microphone tracks
      addLocalTracks(pc, stream);

      // --------------------------------------------------------
      // NOW join the signaling room
      // --------------------------------------------------------

      if (!socket.connected) {
        console.log("🔌 Socket not connected. Connecting...");
        socket.connect();
      }

      socket.emit("join-video-call", {
        roomId,
      });

      console.log(
        "✅ Joined video call room:",
        roomId
      );
    } catch (error) {
      console.error(
        "❌ Camera/Microphone error:",
        error
      );

      alert(
        "Unable to access camera or microphone. Please allow camera and microphone permissions."
      );
    }
  };

  // ============================================================
  // SOCKET SIGNALING
  // ============================================================

  useEffect(() => {
    if (!roomId) return;

    console.log(
      "🎥 Setting up video call for room:",
      roomId
    );

    if (!socket.connected) {
      socket.connect();
    }

    // ==========================================================
    // USER JOINED
    // ==========================================================

    const handleUserJoined = async () => {
      try {
        console.log(
          "📹 Another user joined video call"
        );

        // Make sure local camera exists
        if (!localStream.current) {
          console.warn(
            "⚠️ Local stream not available yet"
          );
          return;
        }

        const pc = createPeerConnection();

        // Make absolutely sure tracks exist
        addLocalTracks(
          pc,
          localStream.current
        );

        console.log("📤 Creating WebRTC offer...");

        const offer =
          await pc.createOffer();

        await pc.setLocalDescription(
          offer
        );

        console.log(
          "📤 Sending WebRTC offer"
        );

        socket.emit("webrtc-offer", {
          roomId,
          offer,
        });
      } catch (error) {
        console.error(
          "❌ Error creating offer:",
          error
        );
      }
    };

    // ==========================================================
    // RECEIVE OFFER
    // ==========================================================

    const handleOffer = async ({
      offer,
    }) => {
      try {
        console.log(
          "📥 WebRTC offer received"
        );

        if (!localStream.current) {
          console.warn(
            "⚠️ Local stream not available while receiving offer"
          );
          return;
        }

        const pc = createPeerConnection();

        // Add local camera/microphone
        addLocalTracks(
          pc,
          localStream.current
        );

        console.log(
          "📥 Setting remote description..."
        );

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            offer
          )
        );

        // Add queued ICE candidates
        if (
          pendingIceCandidates.current
            .length > 0
        ) {
          console.log(
            "🧊 Adding queued ICE candidates:",
            pendingIceCandidates.current
              .length
          );

          for (const candidate of
            pendingIceCandidates.current) {
            try {
              await pc.addIceCandidate(
                candidate
              );
            } catch (error) {
              console.error(
                "❌ Error adding queued ICE candidate:",
                error
              );
            }
          }

          pendingIceCandidates.current =
            [];
        }

        console.log(
          "📤 Creating WebRTC answer..."
        );

        const answer =
          await pc.createAnswer();

        await pc.setLocalDescription(
          answer
        );

        console.log(
          "📤 Sending WebRTC answer"
        );

        socket.emit("webrtc-answer", {
          roomId,
          answer,
        });
      } catch (error) {
        console.error(
          "❌ Error handling WebRTC offer:",
          error
        );
      }
    };

    // ==========================================================
    // RECEIVE ANSWER
    // ==========================================================

    const handleAnswer = async ({
      answer,
    }) => {
      try {
        console.log(
          "📥 WebRTC answer received"
        );

        const pc =
          peerConnection.current;

        if (!pc) {
          console.warn(
            "⚠️ No peer connection available for answer"
          );
          return;
        }

        await pc.setRemoteDescription(
          new RTCSessionDescription(
            answer
          )
        );

        console.log(
          "✅ Remote answer set successfully"
        );

        // Add queued ICE candidates
        if (
          pendingIceCandidates.current
            .length > 0
        ) {
          console.log(
            "🧊 Adding queued ICE candidates:",
            pendingIceCandidates.current
              .length
          );

          for (const candidate of
            pendingIceCandidates.current) {
            try {
              await pc.addIceCandidate(
                candidate
              );
            } catch (error) {
              console.error(
                "❌ Error adding queued ICE candidate:",
                error
              );
            }
          }

          pendingIceCandidates.current =
            [];
        }
      } catch (error) {
        console.error(
          "❌ Error handling WebRTC answer:",
          error
        );
      }
    };

    // ==========================================================
    // RECEIVE ICE CANDIDATE
    // ==========================================================

    const handleIceCandidate = async ({
      candidate,
    }) => {
      try {
        console.log(
          "📥 ICE candidate received"
        );

        if (!candidate) return;

        const iceCandidate =
          new RTCIceCandidate(
            candidate
          );

        const pc =
          peerConnection.current;

        if (!pc) {
          console.log(
            "⏳ Peer connection not ready. Queueing ICE candidate."
          );

          pendingIceCandidates.current.push(
            iceCandidate
          );

          return;
        }

        // Remote description must exist before
        // adding ICE candidates
        if (!pc.remoteDescription) {
          console.log(
            "⏳ Remote description not ready. Queueing ICE candidate."
          );

          pendingIceCandidates.current.push(
            iceCandidate
          );

          return;
        }

        await pc.addIceCandidate(
          iceCandidate
        );

        console.log(
          "✅ ICE candidate added"
        );
      } catch (error) {
        console.error(
          "❌ ICE candidate error:",
          error
        );
      }
    };

    // ==========================================================
    // PARTICIPANT LEFT
    // ==========================================================

    const handleUserLeft = () => {
      console.log(
        "📞 Participant left the call"
      );

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject =
          null;
      }

      setConnected(false);

      pendingIceCandidates.current =
        [];
    };

    // ==========================================================
    // REGISTER SOCKET EVENTS
    // ==========================================================

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

    // ==========================================================
    // CLEANUP
    // ==========================================================

    return () => {
      console.log(
        "🧹 Cleaning up video call socket listeners"
      );

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

  // ============================================================
  // TOGGLE CAMERA
  // ============================================================

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

    console.log(
      "📹 Camera:",
      videoTrack.enabled
        ? "ON"
        : "OFF"
    );
  };

  // ============================================================
  // TOGGLE MICROPHONE
  // ============================================================

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

    console.log(
      "🎤 Microphone:",
      audioTrack.enabled
        ? "ON"
        : "OFF"
    );
  };

  // ============================================================
  // STOP SCREEN SHARE
  // ============================================================

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
              sender.track.kind ===
                "video"
          );

      if (sender && cameraTrack) {
        await sender.replaceTrack(
          cameraTrack
        );
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject =
          localStream.current;

        try {
          await localVideoRef.current.play();
        } catch (error) {
          console.warn(
            "Local video play warning:",
            error
          );
        }
      }

      setScreenSharing(false);

      console.log(
        "🛑 Screen sharing stopped"
      );
    } catch (error) {
      console.error(
        "❌ Stop screen sharing error:",
        error
      );
    }
  };

  // ============================================================
  // SCREEN SHARING
  // ============================================================

  const toggleScreenShare = async () => {
    if (!peerConnection.current) {
      console.log(
        "⚠️ Peer connection not available"
      );
      return;
    }

    try {
      if (!screenSharing) {
        console.log(
          "🖥️ Starting screen sharing..."
        );

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
                sender.track.kind ===
                  "video"
            );

        if (sender) {
          await sender.replaceTrack(
            screenTrack
          );
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject =
            screenStream;

          try {
            await localVideoRef.current.play();
          } catch (error) {
            console.warn(
              "Screen video play warning:",
              error
            );
          }
        }

        setScreenSharing(true);

        screenTrack.onended =
          async () => {
            await stopScreenShare();
          };

        console.log(
          "✅ Screen sharing started"
        );
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error(
        "❌ Screen sharing error:",
        error
      );
    }
  };

  // ============================================================
  // START RECORDING
  // ============================================================

  const startRecording = () => {
    if (!localStream.current) {
      console.log(
        "⚠️ No camera stream available"
      );
      return;
    }

    try {
      recordedChunks.current = [];

      let options = {};

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

      mediaRecorder.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
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

        document.body.appendChild(
          link
        );

        link.click();

        document.body.removeChild(
          link
        );

        URL.revokeObjectURL(url);

        recordedChunks.current = [];
      };

      recorder.onerror = (event) => {
        console.error(
          "❌ MediaRecorder error:",
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
        "❌ Recording error:",
        error
      );
    }
  };

  // ============================================================
  // STOP RECORDING
  // ============================================================

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

  // ============================================================
  // LEAVE CALL
  // ============================================================

  const leaveCall = () => {
    console.log(
      "📞 Leaving video call"
    );

    // Stop recording
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

    // Close peer connection
    if (peerConnection.current) {
      peerConnection.current.close();

      peerConnection.current = null;
    }

    // Clear ICE queue
    pendingIceCandidates.current =
      [];

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

    console.log(
      "✅ Left video call"
    );
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="border rounded-xl p-6 shadow bg-white mt-6">

      <h2 className="text-2xl font-bold mb-4">
        📹 Video Call
      </h2>

      {/* ========================================================
          VIDEO AREA
      ======================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ======================================================
            LOCAL VIDEO
        ====================================================== */}

        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />

          {!cameraOn &&
            !screenSharing && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Camera Off
              </div>
            )}

          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 rounded">
            You
          </div>

        </div>

        {/* ======================================================
            REMOTE VIDEO
        ====================================================== */}

        <div className="bg-black rounded-xl overflow-hidden aspect-video relative">

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls={false}
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

      {/* ========================================================
          CONTROLS
      ======================================================== */}

      <div className="flex flex-wrap gap-3 mt-5">

        {/* JOIN VIDEO */}

        {!cameraOn &&
        !localStream.current ? (
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
              onClick={
                toggleScreenShare
              }
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