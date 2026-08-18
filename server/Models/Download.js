const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    userPlan: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Download", downloadSchema);