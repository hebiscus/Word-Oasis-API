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
                author: req.user,
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
    try {
        const blogpost = await blogPost.findById(req.params.id).populate("author").exec();
        if (blogpost === null) {
            return res.status(403).json("no blog post with this ID was found");
        }
        res.status(202).json({blogpost: blogpost});
    } catch(err) {
        return next(err);
    }
});

exports.onePost_update = [
    body("title").trim().escape().isLength({min: 2, max: 80}).withMessage("title should be between 2 and 80 characters"),
    body("content").trim().escape().isLength({min: 2, max: 20000}).withMessage("blog post should be between 2 and 20 000 characters"),
    body("status").isIn(["unpublished", "published"]).withMessage("invalid status value"),
    body("creationDate").isISO8601(),
    
    (async (req, res, next) => {
        console.log("yup")
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(403).json({errors: errors.array()})
        }
        
        const updatedPost = {
            author: req.user,
            title: req.body.title,
            content: req.body.content,
            status: req.body.status,
            creationDate: req.body.creationDate};

        try {
            const blogpost = await blogPost.findByIdAndUpdate(req.params.postId, updatedPost);
            if (blogpost === null) {
                return res.status(403).json("no blog post with this ID was found");
            }
            res.status(202).json({message: "blog post got updated!", blogpost: blogpost});
        } catch(err) {
            console.log("error")
            return next(err);
        }
    })
];

exports.onePost_delete = (async (req, res, next) => {
        try {
            const blogpost = await blogPost.findByIdAndDelete(req.params.postId);
            if (blogpost === null) {
                return res.status(403).json("no blog post with this ID was found");
            }
            res.status(202).json({message: "blog post got deleted!", blogpost: blogpost});
        } catch(err) {
            console.log("error")
            return next(err);
        }
    })

exports.comments_get = (async (req, res, next) => {

});

exports.comments_create = (async (req, res, next) => {

});