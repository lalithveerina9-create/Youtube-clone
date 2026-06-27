const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
    channelName: String,
    email: String,
    password: String
});

const Auth = mongoose.model("Auth", authSchema);

module.exports = Auth;