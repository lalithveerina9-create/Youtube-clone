const express = require("express");
const router = express.Router();

const Subscription = require("../Models/Subscription");
const Channel = require("../Models/Channel");

// SUBSCRIBE
router.post("/add", async (req, res) => {

  try {

    const { userId, channelId } = req.body;

    const exists = await Subscription.findOne({
      userId,
      channelId,
    });

    if (exists) {
      return res.json({
        success: true,
        message: "Already Subscribed",
      });
    }

    await Subscription.create({
      userId,
      channelId,
    });

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $inc: {
          subscribers: 1,
        },
      }
    );

    res.json({
      success: true,
      message: "Subscribed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

// UNSUBSCRIBE
router.post("/remove", async (req, res) => {

  try {

    const { userId, channelId } = req.body;

    await Subscription.findOneAndDelete({
      userId,
      channelId,
    });

    await Channel.findByIdAndUpdate(
      channelId,
      {
        $inc: {
          subscribers: -1,
        },
      }
    );

    res.json({
      success: true,
      message: "Unsubscribed",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

// GET USER SUBSCRIPTIONS
router.get("/:userId", async (req, res) => {

  try {

    const subscriptions =
      await Subscription.find({
        userId: req.params.userId,
      }).populate("channelId");

    res.json({
      success: true,
      result: subscriptions,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});

module.exports = router;