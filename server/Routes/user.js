const express = require("express");
const router = express.Router();

const User = require("../Models/User");
const sendLoginOTP = require("../utils/sendLoginOTP");

// =======================================
// LOGIN
// =======================================
router.post("/login", async (req, res) => {
  try {
    const {
      email,
      name,
      image,
      deviceId,
      browser,
      os,
      city,
      state,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    let user = await User.findOne({ email });

    // Get current hour in IST
    const currentHourIST = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hour12: false,
      }).format(new Date())
    );

    const automaticTheme =
      currentHourIST >= 10 && currentHourIST < 12
        ? "light"
        : "dark";
    // ===========================
    // NEW USER
    // ===========================
    if (!user) {
      user = await User.create({
        email,
        name,
        image,
        theme: automaticTheme,
        manualTheme: false,

        trustedDevices: [
          {
            deviceId,
            browser,
            os,
            city,
            state,
          },
        ],
      });

      return res.status(200).json({
        success: true,
        otpRequired: false,
        result: user,
      });
    }

    // ===========================
    // UPDATE USER PROFILE
    // ===========================
    user.name = name || user.name;
    user.image = image || user.image;

    if (!user.manualTheme) {
      user.theme = automaticTheme;
    }

    // ===========================
    // CHECK TRUSTED DEVICE
    // ===========================
    const trustedDevice = user.trustedDevices.find(
      (device) => device.deviceId === deviceId
    );

    // Trusted Device
    if (trustedDevice) {
      trustedDevice.lastLogin = new Date();

      await user.save();

      return res.status(200).json({
        success: true,
        otpRequired: false,
        result: user,
      });
    }

    // ===========================
    // NEW DEVICE
    // ===========================
    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.loginOtp = otp;
    user.loginOtpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    await user.save();

   await sendLoginOTP({
  email: user.email,
  name: user.name,
  otp,
});

    return res.status(200).json({
      success: true,
      otpRequired: true,
      email: user.email,
      message: "OTP sent successfully.",
    });

  } catch (error) {
    console.error("User Login Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// =======================================
// VERIFY LOGIN OTP
// =======================================
router.post("/verify-login-otp", async (req, res) => {
  try {
    const {
      email,
      otp,
      deviceId,
      browser,
      os,
      city,
      state,
    } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.loginOtp || user.loginOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (user.loginOtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    const trustedDevice = user.trustedDevices.find(
      (device) => device.deviceId === deviceId
    );

    if (!trustedDevice) {
      user.trustedDevices.push({
        deviceId,
        browser,
        os,
        city,
        state,
        lastLogin: new Date(),
      });
    }

    user.loginOtp = null;
    user.loginOtpExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      result: user,
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// ===============================
// MANUALLY UPDATE USER THEME
// ===============================
router.put("/theme", async (req, res) => {
  try {
    const { userId, theme } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: "Invalid theme.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        theme: theme,
        manualTheme: true,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theme updated successfully.",
      result: user,
    });

  } catch (error) {
    console.error("Theme Update Error:", error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
module.exports = router;