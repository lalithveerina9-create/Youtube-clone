const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
  channelName: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "",
  },

  userId: {
    type: String,
    required: true,
  },

  profilePic: {
    type: String,
    default: "/avatar/default-avatar.png",
  },

  banner: {
    type: String,
    default: "/banner/default-banner.jpg",
  },

  subscribers: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Channel", channelSchema);