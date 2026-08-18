const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },

  userName: {
    type: String,
    required: true,
  },

  comment: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
},

dislikes: {
    type: Number,
    default: 0,
},

reports: {
    type: Number,
    default: 0,
},

flagged: {
    type: Boolean,
    default: false,
},
  language:{
    type:String,
    default:"unknown"
  },
  location: {
    type: String,
},

showLocation: {
    type: Boolean,
    default: false,
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);