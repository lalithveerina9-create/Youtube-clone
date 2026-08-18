const express = require("express");
const router = express.Router();

const Comment = require("../Models/Comment");
function detectLanguage(text) {
  if (/[\u0C00-\u0C7F]/.test(text)) return "Telugu";
  if (/[\u0900-\u097F]/.test(text)) return "Hindi";
  if (/[\u0B80-\u0BFF]/.test(text)) return "Tamil";
  if (/[\u0C80-\u0CFF]/.test(text)) return "Kannada";
  if (/[\u0D00-\u0D7F]/.test(text)) return "Malayalam";
  if (/[\u0980-\u09FF]/.test(text)) return "Bengali";
  if (/[\u0A80-\u0AFF]/.test(text)) return "Gujarati";
  if (/[\u0A00-\u0A7F]/.test(text)) return "Punjabi";
  if (/[\u0900-\u097F]/.test(text)) return "Marathi";

  return "English";
}

const abusiveWords=[
  "idiot",
  "stupid",
  "dumb",
  "fool",
  "moron"
];

router.post("/create", async (req, res) => {
  try {
    const {
      videoId,
      userName,
      comment,
      location,
      showLocation,
    } = req.body;


    if (!videoId || !userName || !comment) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }
     const cleanedComment = comment.toLowerCase();
    const words = cleanedComment.split(" ");
    const hasAbusiveWord = words.some((word) => {
      return abusiveWords.includes(word);
    });
    if(hasAbusiveWord){
      return res.status(400).json({
        success: false,
        message: "Comment contains abusive words.",
      }); 
    }
   let previousChar = "";
let consecutiveCount = 1;
const specialCharacters = "!@#$%^&*()_+-=[]{}|;':\",.<>?/`~";
for (const char of cleanedComment) {
  if (specialCharacters.includes(char)) {
    if (char === previousChar) {
      consecutiveCount++;
      if (consecutiveCount >= 10) {
        return res.status(400).json({
          success: false,
          message:
            "Your comment appears to contain spam. Please avoid repeating the same special character.",
        });
      }
    } else {
      consecutiveCount = 1;
    }
  } else {
    consecutiveCount = 1;
  }
  previousChar = char;
}

    const uniqueWords=new Set(words);
     const difference=words.length-uniqueWords.size;
    if(difference>2){
      return res.status(400).json({
        success:false,
        message:"Your comment appears to contain spam. Please avoid repeating the same words."
      });
    }
    
    const duplicateComment = await Comment.findOne({
      videoId:videoId,
      userName:userName,
      comment:comment
    });
      if(duplicateComment){
        return res.status(400).json({
          success:false,
          message:"You have already posted the same comment."
        });
      }
    const language = detectLanguage(comment);

    const newComment = await Comment.create({
      videoId,
      userName,
      comment,
      language,
      location,
      showLocation,
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
router.put("/like", async (req, res) => {
  try{
    const{commentId}=req.body;
    if(!commentId){
      return res.status(404).json({
        success:false,
        message:"Comment ID is required."
      });
    }
    const updatedComment= await Comment.findByIdAndUpdate(
      commentId,
      {$inc:{likes:1}},
      {new:true}
    );
    res.json({
      success: true,
      result: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.put("/dislike", async (req, res) => {
  try{
    const{commentId}=req.body;
    if(!commentId){
      return res.status(404).json({
        success:false,
        message:"Comment ID is required."
      });
    }
    const updatedComment= await Comment.findByIdAndUpdate(
      commentId,
      {$inc:{dislikes:1}},
      {new:true}
    );
    res.json({
      success: true,
      result: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
router.put("/report", async (req, res) => {
  try{
    const{commentId}=req.body;
    if(!commentId){
      return res.status(400).json({
        success:false,
        message:"Comment ID is required."
      });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
  commentId,
  {
    $inc: {
      reports: 1,
    },
    $set: {
      flagged: true,
    },
  },
  { new: true},
);
    if (!updatedComment) {
  return res.status(404).json({
    success: false,
    message: "Comment not found.",
  });
}
    res.json({
      success: true,
      result: updatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
module.exports = router;