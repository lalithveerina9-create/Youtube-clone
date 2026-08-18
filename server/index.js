require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/user");
const channelRoutes = require("./Routes/channel");
const videoRoutes = require("./Routes/video");
const commentRoutes = require("./Routes/comment");
const historyRoutes = require("./Routes/history");
const likedVideoRoutes = require("./Routes/likedVideo");
const watchLaterRoutes = require("./Routes/watchLater");
const downloadRoute = require("./Routes/download");
const subscriptionRoutes = require("./Routes/subscription");
const translateRoutes = require("./Routes/translate");
const paymentRoute = require("./Routes/payment");
const watchPartyRoutes = require("./Routes/watchParty");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    console.log("📂 Database Name:", mongoose.connection.name);
    console.log("🌐 Host:", mongoose.connection.host);
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
  });

// API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/channel", channelRoutes);
app.use("/video", videoRoutes);
app.use("/comment", commentRoutes);
app.use("/history", historyRoutes);
app.use("/likedvideo", likedVideoRoutes);
app.use("/watchlater", watchLaterRoutes);
app.use("/download", downloadRoute);
app.use("/subscription", subscriptionRoutes);
app.use("/translate", translateRoutes);
app.use("/payment", paymentRoute);
app.use("/watchparty", watchPartyRoutes);
// ================================
// SOCKET.IO
// ================================

io.on("connection", (socket) => {

  console.log("🟢 User Connected:", socket.id);

  // ========================
  // JOIN ROOM
  // ========================

  socket.on("join-room", ({ roomId, username }) => {

    socket.join(roomId);

    console.log(`${username} joined ${roomId}`);

    io.to(roomId).emit("participant-joined", {
      username,
    });

  });

  // ========================
// VIDEO CALL
// ========================

socket.on("join-video-call", ({ roomId }) => {

  socket.join(`video-${roomId}`);

  console.log(
    `📹 User joined video call: ${roomId}`
  );

  socket.to(`video-${roomId}`).emit(
    "video-call-user-joined"
  );

});

// ========================
// WEBRTC OFFER
// ========================

socket.on(
  "webrtc-offer",
  ({ roomId, offer }) => {

    socket.to(`video-${roomId}`).emit(
      "webrtc-offer",
      {
        offer,
      }
    );

  }
);

// ========================
// WEBRTC ANSWER
// ========================

socket.on(
  "webrtc-answer",
  ({ roomId, answer }) => {

    socket.to(`video-${roomId}`).emit(
      "webrtc-answer",
      {
        answer,
      }
    );

  }
);

// ========================
// WEBRTC ICE CANDIDATE
// ========================

socket.on(
  "webrtc-ice-candidate",
  ({ roomId, candidate }) => {

    socket.to(`video-${roomId}`).emit(
      "webrtc-ice-candidate",
      {
        candidate,
      }
    );

  }
);

// ========================
// LEAVE VIDEO CALL
// ========================

socket.on(
  "leave-video-call",
  ({ roomId }) => {

    socket.leave(`video-${roomId}`);

    socket.to(`video-${roomId}`).emit(
      "video-call-user-left"
    );

    console.log(
      `📞 User left video call: ${roomId}`
    );

  }
);

  // ========================
  // LIVE CHAT
  // ========================

  socket.on("send-message", ({ roomId, username, message }) => {

    io.to(roomId).emit("receive-message", {
      username,
      message,
      time: new Date().toLocaleTimeString(),
    });

  });

  // ========================
  // PLAY VIDEO
  // ========================

  socket.on("play-video", (roomId) => {

    socket.to(roomId).emit("play-video");

  });

  // ========================
// SEEK VIDEO
// ========================

socket.on("seek-video", ({ roomId, currentTime }) => {

  socket.to(roomId).emit("seek-video", {
    currentTime,
  });

});

  // ========================
  // PAUSE VIDEO
  // ========================

  socket.on("pause-video", (roomId) => {

    socket.to(roomId).emit("pause-video");

  });

  socket.on("disconnect", () => {

    console.log("🔴 User Disconnected");

  });

});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);

});