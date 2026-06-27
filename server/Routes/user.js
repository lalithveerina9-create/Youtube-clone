const express = require("express");
const router = express.Router();

const User = require("../Models/User");

router.post("/login", async (req, res) => {
  try {
    const { email, name, image } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        image,
      });
    }

    res.json({
      success: true,
      result: user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;