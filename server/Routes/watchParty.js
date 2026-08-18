const express = require("express");
const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const WatchParty = require("../Models/WatchParty");

// Create Watch Party
router.post("/create", async (req, res) => {
    console.log("🔥 POST /watchparty/create HIT");
  console.log(req.method);
  console.log(req.originalUrl);
  console.log(req.body);

  try {
    const { hostId, videoId } = req.body;

    const roomId = uuidv4();

    const room = await WatchParty.create({
      roomId,
      hostId,
      videoId,
      participants: [
        {
          userId: hostId,
          username: "Host", // You can modify this to get the actual username if needed
        },
      ],
    });

    res.status(201).json({
      success: true,
      room,
      inviteLink: `http://localhost:3000/watch-party/${roomId}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =============================
// JOIN WATCH PARTY
// =============================

router.post("/join", async (req, res) => {

  try {

    const { roomId, userId, username } = req.body;

    const room = await WatchParty.findOne({ roomId });

    if (!room) {

      return res.status(404).json({
        success: false,
        message: "Room not found",
      });

    }

    const alreadyJoined = room.participants.find(
      (participant) => participant.userId === userId
    );

    if (!alreadyJoined) {

      room.participants.push({
        userId,
        username,
      });

      await room.save();

    }

    res.json({
      success: true,
      room,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

});
// Join Watch Party

router.get("/:roomId", async (req, res) => {
  console.log("🔥 GET /watchparty/:roomId HIT");
  console.log(req.params.roomId);

  try {
    const room = await WatchParty.findOne({
      roomId: req.params.roomId,
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.json({
      success: true,
      room,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
  

module.exports = router;