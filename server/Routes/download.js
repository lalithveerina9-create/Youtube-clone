const express = require("express");
const router = express.Router();

const Download = require("../Models/Download");
const User = require("../Models/User");
const Video = require("../Models/Video");

router.post("/", async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    // Validate request
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Video ID is required.",
      });
    }

    // Check user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check video
    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // Get user plan
    const userPlan = user.userPlan;
let downloadLimit;
if(userPlan === "Free") {
  downloadLimit=1;
}
else if(userPlan === "Bronze") {
  downloadLimit=10;
}
else if(userPlan === "Silver") {
  downloadLimit=100;
}
else if(userPlan === "Gold") {
  downloadLimit=Infinity;
}
else {
  return res.status(400).json({
    success: false,
    message: "Invalid user plan.",
  });
}
// Only check the limit if it is not unlimited
if (downloadLimit !== Infinity) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const downloadCount = await Download.countDocuments({
    user: userId,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  });

  if (downloadCount >= downloadLimit) {
    return res.status(403).json({
      success: false,
      message: `Your ${userPlan} plan allows only ${downloadLimit} downloads per day.`,
    });
  }
}
    // Save download
    const download = await Download.create({
      user: userId,
      video: videoId,
      userPlan: userPlan,
    });

    return res.status(201).json({
      success: true,
      message: "Download authorized successfully.",
      result: download,
      downloadUrl: video.videoUrl,
    });
  } catch (error) {
    console.error("Download Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }
const user = await User.findById(userId);

if (!user) {
    return res.status(404).json({
        success: false,
        message: "User not found.",
    });
}
const downloads=await Download.find({ user: userId })
.populate("video")
.sort({ createdAt: -1 });
return res.status(200).json({
  success: true,
  message: "Downloads retrieved successfully.",
  downloads: downloads,
 });
}
 catch (error) {
    console.error("Download Route Error:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}); 

module.exports = router;