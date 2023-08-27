const mongoose = require("mongoose");

const blogPostSchema = mongoose.Schema({
    author: {type: mongoose.Schema.ObjectId, ref: Admin, required: true},
    title: {type: String, minlength: 2, maxlength: 80, required: true},
    content: {type: String, minlength: 2, maxlength: 20000, required: true},
    status: {type: String, enum: ["unpublished", "published"], required: true},
    creationDate: {type: Date, default: Date.now, required: true},
});

module.exports = mongoose.model("BlogPost", blogPostSchema);