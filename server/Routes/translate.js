const express = require("express");
const router = express.Router();

const { translate } = require("google-translate-api-x");

router.post("/", async (req, res) => {
  try {
    const { text, target } = req.body;

    if (!text || !target) {
      return res.status(400).json({
        success: false,
        message: "Text and target language are required.",
      });
    }

    const result = await translate(text, {
      to: target,
    });

    res.json({
      success: true,
      translatedText: result.text,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
});

module.exports = router;