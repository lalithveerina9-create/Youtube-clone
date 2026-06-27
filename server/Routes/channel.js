const express = require("express");
const router = express.Router();

const Channel = require("../Models/Channel");

// =======================================
// GET CHANNEL BY USER ID
// =======================================
router.get("/user/:userId", async (req, res) => {

  try {

    const channel = await Channel.findOne({
      userId: req.params.userId,
    });

    if (!channel) {

      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });

    }

    res.json({
      success: true,
      result: channel,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

// =======================================
// CREATE CHANNEL
// =======================================
router.post("/create", async (req, res) => {

  try {

    const {
      channelName,
      description,
      userId,
      profilePic,
      banner,
    } = req.body;

    const existingChannel =
      await Channel.findOne({
        userId,
      });

    if (existingChannel) {

      return res.status(400).json({
        success: false,
        message: "Channel already exists",
      });

    }

    const channel = await Channel.create({

      channelName,

      description,

      userId,

      profilePic,

      banner,

      subscribers: 0,

    });

    res.status(201).json({

      success: true,

      result: channel,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});

// =======================================
// GET CHANNEL BY CHANNEL ID
// =======================================
router.get("/:id", async (req, res) => {

  try {

    const channel =
      await Channel.findById(
        req.params.id
      );

    if (!channel) {

      return res.status(404).json({

        success: false,

        message: "Channel not found",

      });

    }

    res.json({

      success: true,

      result: channel,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});

// =======================================
// SUBSCRIBE
// =======================================
router.post("/subscribe/:id", async (req, res) => {

  try {

    const channel =
      await Channel.findByIdAndUpdate(

        req.params.id,

        {
          $inc: {
            subscribers: 1,
          },
        },

        {
          new: true,
        }

      );

    res.json({

      success: true,

      result: channel,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});

// =======================================
// UNSUBSCRIBE
// =======================================
router.post("/unsubscribe/:id", async (req, res) => {

  try {

    const channel =
      await Channel.findByIdAndUpdate(

        req.params.id,

        {
          $inc: {
            subscribers: -1,
          },
        },

        {
          new: true,
        }

      );

    res.json({

      success: true,

      result: channel,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message,

    });

  }

});

module.exports = router;