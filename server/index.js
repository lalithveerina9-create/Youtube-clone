const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Routes
const authRoutes = require("./Routes/auth");
const userRoutes = require("./Routes/user");
const channelRoutes = require("./Routes/channel");
const videoRoutes = require("./Routes/video");
const commentRoutes = require("./Routes/comment");
const historyRoutes = require("./Routes/history");
const likedVideoRoutes = require("./Routes/likedVideo");
const watchLaterRoutes = require("./Routes/watchLater");
const subscriptionRoutes = require("./Routes/subscription");

app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://127.0.0.1:27017/youtube-clone")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

console.log("Trying to connect...");

// API Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/channel", channelRoutes);
app.use("/video", videoRoutes);
app.use("/comment", commentRoutes);
app.use("/history", historyRoutes);
app.use("/likedvideo", likedVideoRoutes);
app.use("/watchlater", watchLaterRoutes);
app.use("/subscription", subscriptionRoutes);

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});