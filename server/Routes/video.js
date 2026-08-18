const express = require("express");
const router = express.Router();

const Video = require("../Models/Video");
const User = require("../Models/User");
const upload = require("../middleware/upload");
const cloudinary = require("../config/cloudinary");

router.post("/upload", upload.single("video"), async (req, res) => {
  console.log("✅ /video/upload route hit");

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video uploaded",
      });
    }

    console.log("Uploaded file:", req.file);

    res.json({
      success: true,
      videoUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Upload Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
// ===============================
// CREATE VIDEO
// ===============================
router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnailUrl,
      videoUrl,
      channelId,
      channelName,
      channelAvatar,
      duration,
      isPremium,
    } = req.body;

    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      channelId,
      channelName,
      channelAvatar,
      duration,
      isPremium: isPremium || false,
      views: 0,
      likes: 0,
      dislikes: 0,
      watchLater: false,
    });

    res.status(201).json({
      success: true,
      result: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// SEARCH
// Search by Title, Description & Channel Name
// ===============================
router.get("/search/:keyword", async (req, res) => {
  try {
    const keyword = req.params.keyword;

    const videos = await Video.find({
      $or: [
        {
          title: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          channelName: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      result: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// CHANNEL VIDEOS
// Keep this BEFORE /:id
// ===============================
router.get("/channel/:channelId", async (req, res) => {
  try {
    const videos = await Video.find({
      channelId: req.params.channelId,
    });

    res.json({
      success: true,
      result: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// LIKE
// ===============================
router.post("/like/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.likes += 1;
    await video.save();

    res.json({
      success: true,
      result: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// DISLIKE
// ===============================
router.post("/dislike/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.dislikes += 1;
    await video.save();

    res.json({
      success: true,
      result: video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// GET VIDEO
// Automatically increase views
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const { userId } = req.query;

    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    // Check Premium Video Access
    if (video.isPremium) {

      // User must be logged in
      if (!userId) {
        return res.status(403).json({
          success: false,
          premiumRestricted: true,
          message: "Please login and upgrade your plan to watch this premium video.",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Free users cannot watch premium videos
      if (user.userPlan === "Free") {
        return res.status(403).json({
          success: false,
          premiumRestricted: true,
          message: "This is a Premium Video. Upgrade your subscription to watch it.",
        });
      }
    }

    // Increase views only when access is allowed
    video.views += 1;

    await video.save();

    res.json({
      success: true,
      result: video,
    });

  } catch (error) {
    console.error("Get Video Error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// ===============================
// GET ALL VIDEOS
// ===============================
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find();

    res.json({
      success: true,
      result: videos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;