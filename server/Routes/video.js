const express = require("express");
const router = express.Router();

const Video = require("../Models/Video");

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
// ===============================
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
// IMPORTANT:
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

    const video =
      await Video.findById(req.params.id);

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

    const video =
      await Video.findById(req.params.id);

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

    const video =
      await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.views += 1;

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