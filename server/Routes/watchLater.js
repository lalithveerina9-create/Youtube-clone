const express = require("express");
const router = express.Router();

const Video = require("../Models/Video");

// ADD TO WATCH LATER
router.post("/add", async (req, res) => {

    try {

        const { videoId } = req.body;

        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).json({
                success:false,
                message:"Video not found"
            });
        }

        video.watchLater = true;

        await video.save();

        res.json({
            success:true,
            result:video
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});

// GET WATCH LATER
router.get("/", async (req,res)=>{

    try{

        const videos = await Video.find({
            watchLater:true
        });

        res.json({
            success:true,
            result:videos
        });

    }catch(error){

        res.status(500).json({
            success:false,
            error:error.message
        });

    }

});

module.exports = router;