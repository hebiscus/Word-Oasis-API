const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    blogpost: {type: mongoose.Schema.ObjectId, ref: "BlogPost", required: true},
    author: {type: String, minlength: 1, maxlength: 30, required: true},
    content: {type: String, minlength: 3, maxlength: 300, required: true},
    reationDate: {type: Date, default: Date.now, required: true},
});

module.exports = mongoose.model("Comment", commentSchema);