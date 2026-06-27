const express = require("express");
const router = express.Router();

const History = require("../Models/History");

// ADD TO HISTORY
router.post("/create", async (req, res) => {
  try {

    const { userId, videoId } = req.body;

    const history = await History.create({
      userId,
      videoId,
    });

    res.status(201).json({
      success: true,
      result: history,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

// GET USER HISTORY
router.get("/:userId", async (req, res) => {
  try {

    const history = await History.find({
      userId: req.params.userId,
    }).populate("videoId");

    res.json({
      success: true,
      result: history,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

module.exports = router;