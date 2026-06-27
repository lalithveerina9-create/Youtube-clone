const express = require("express");
const router = express.Router();

const Auth = require("../Models/Auth");

router.get("/", (req, res) => {
    res.send("Auth Route Working");
});

router.post("/signup", async (req, res) => {
    try {
        const user = new Auth(req.body);

        await user.save();

        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;