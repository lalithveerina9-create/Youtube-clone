const express = require("express");
const router = express.Router();

const Comment = require("../Models/Comment");

// CREATE COMMENT
router.post("/create", async (req, res) => {
  try {

    const {
      videoId,
      userName,
      comment,
    } = req.body;

    const newComment = await Comment.create({
      videoId,
      userName,
      comment,
    });

    res.status(201).json({
      success: true,
      result: newComment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET COMMENTS OF A VIDEO
router.get("/:videoId", async (req, res) => {
  try {

    const comments = await Comment.find({
      videoId: req.params.videoId,
    });

    res.json({
      success: true,
      result: comments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;