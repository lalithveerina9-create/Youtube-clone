const mongoose = require("mongoose");

const watchPartySchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    hostId: {
      type: String,
      required: true,
    },

    videoId: {
      type: String,
      required: true,
    },

    participants: [
      {
        userId: String,
        username: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WatchParty", watchPartySchema);