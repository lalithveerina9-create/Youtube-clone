const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  thumbnailUrl: {
    type: String,
    default: "",
  },

  videoUrl: {
    type: String,
    default: "",
  },

  channelId: {
    type: String,
    required: true,
  },

  // NEW - Channel Name
  channelName: {
    type: String,
    default: "",
  },

  // NEW - Channel Avatar
  channelAvatar: {
    type: String,
    default: "",
  },

  views: {
    type: Number,
    default: 0,
  },

  likes: {
    type: Number,
    default: 0,
  },

  dislikes: {
    type: Number,
    default: 0,
  },

  watchLater: {
    type: Boolean,
    default: false,
  },

  // NEW - Duration
  duration: {
    type: String,
    default: "0:00",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Video", videoSchema);