const blogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.posts_get = (async (req, res, next) => {
    try {
        const allPosts = await blogPost.find();
        if (allPosts.length === 0) {
            res.json("no blog posts available yet");
        }
        res.status(200).json({blogPosts: allPosts});
    } catch(err) {
        return next(err);
    }
});

exports.posts_create = [
    body("title").trim().escape().isLength({min: 2, max: 80}).withMessage("title should be between 2 and 80 characters"),
    body("content").trim().escape().isLength({min: 2, max: 20000}).withMessage("blog post should be between 2 and 20 000 characters"),
    body("status").isIn(["unpublished", "published"]).withMessage("invalid status value"),
    body("creationDate").isISO8601(),
    
    (async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(403).json({errors: errors.array()})
        }
        try {
            const newPost = new blogPost({
                // admin has to be stored on the frontend
                // author: req.admin,
                title: req.body.title,
                content: req.body.content,
                status: req.body.status,
                creationDate: req.body.creationDate,
            })
            await newPost.save();
            res.status(200).json("successfully created a blog post!")
        } catch(err) {
            console.log(err)
            return next(err);
        }
    })
];

exports.onePost_get = (async (req, res, next) => {

});

exports.onePost_update = (async (req, res, next) => {

});

exports.onePost_delete = (async (req, res, next) => {

});

exports.comments_get = (async (req, res, next) => {

});

exports.comments_create = (async (req, res, next) => {

});