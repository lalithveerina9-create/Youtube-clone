const express = require("express");
const router = express.Router();

const LikedVideo = require("../Models/LikedVideo");
const Video = require("../Models/Video");

// LIKE VIDEO
router.post("/add", async (req, res) => {
  try {

    const { userId, videoId } = req.body;

    const exists = await LikedVideo.findOne({
      userId,
      videoId,
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Already Liked",
      });
    }

    await LikedVideo.create({
      userId,
      videoId,
    });

    await Video.findByIdAndUpdate(
      videoId,
      {
        $inc: {
          likes: 1,
        },
      }
    );

    res.json({
      success: true,
      message: "Video Liked",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

// GET LIKED VIDEOS
router.get("/:userId", async (req, res) => {
  try {

    const likedVideos =
      await LikedVideo.find({
        userId: req.params.userId,
      }).populate("videoId");

    res.json({
      success: true,
      result: likedVideos,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

// REMOVE LIKE
router.delete("/:id", async (req, res) => {
  try {

    const likedVideo =
      await LikedVideo.findById(req.params.id);

    if (likedVideo) {

      await Video.findByIdAndUpdate(
        likedVideo.videoId,
        {
          $inc: {
            likes: -1,
          },
        }
      );

      await likedVideo.deleteOne();
    }

    res.json({
      success: true,
      message: "Like Removed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

module.exports = router;