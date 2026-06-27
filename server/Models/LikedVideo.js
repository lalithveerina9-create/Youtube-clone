const mongoose = require("mongoose");

const likedVideoSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LikedVideo",
  likedVideoSchema
);