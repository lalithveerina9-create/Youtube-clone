const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,

  email: String,

  image: String,

  userPlan: {
    type: String,
    enum: ["Free", "Bronze", "Silver", "Gold"],
    default: "Free",
  },

  // Current selected theme
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "dark",
  },

  // False = automatic theme
  // True = manually selected
  manualTheme: {
    type: Boolean,
    default: false,
  },

  // ===============================
  // LOGIN OTP
  // ===============================
  loginOtp: {
    type: String,
    default: null,
  },

  loginOtpExpires: {
    type: Date,
    default: null,
  },

  // ===============================
  // TRUSTED DEVICES
  // ===============================
  trustedDevices: [
    {
      deviceId: {
        type: String,
        required: true,
      },

      browser: {
        type: String,
        default: "Unknown",
      },

      os: {
        type: String,
        default: "Unknown",
      },

      city: {
        type: String,
        default: "Unknown",
      },

      state: {
        type: String,
        default: "Unknown",
      },

      lastLogin: {
        type: Date,
        default: Date.now,
      },
    },
  ],

});

module.exports = mongoose.model("User", userSchema);