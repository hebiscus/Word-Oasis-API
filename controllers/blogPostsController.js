const blogPost = require("../models/blogPost");
const comment = require("../models/comment");
const { body, validationResult } = require("express-validator");

exports.posts_get = (async (req, res, next) => {
    const {title, limit, sorting} = req.query;
    const sortingValue = sorting === "ascending" ? 1 : -1; 

    try {
        if (title) {
            const foundPost = await blogPost.findOne({title : title});
            res.status(200).json(foundPost);
        }
        if (sorting) {
            const foundPosts = await blogPost.find().limit(limit || 0).sort({creationDate: sortingValue});
            res.status(200).json(foundPosts);
        }
        const foundPosts = await blogPost.find().skip(1).limit(limit || 0);
        if (foundPosts.length === 0) {
            res.json("no blog posts available yet");
        }
        res.status(200).json(foundPosts);
    } catch(err) {
        return next(err);
    }
});

exports.posts_create = [
    body("title").trim().isLength({min: 2, max: 80}).withMessage("title should be between 2 and 80 characters"),
    body("content").trim().isLength({min: 2, max: 20000}).withMessage("blog post should be between 2 and 20 000 characters"),
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
    console.log(req.params.id);
    console.log(req.params.postId)
    try {
        const blogpost = await blogPost.findById(req.params.postId).populate("author").exec();
        if (blogpost === null) {
            return res.json("no blog post with this ID was found");
        }
        res.status(202).json(blogpost);
    } catch(err) {
        return next(err);
    }
});

exports.onePost_update = [
    body("title").trim().isLength({min: 2, max: 80}).withMessage("title should be between 2 and 80 characters"),
    body("content").trim().isLength({min: 2, max: 20000}).withMessage("blog post should be between 2 and 20 000 characters"),
    body("status").isIn(["unpublished", "published"]).withMessage("invalid status value"),
    body("creationDate").isISO8601(),
    
    (async (req, res, next) => {
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
    try {
        const comments = await comment.find({blogpost: req.params.postId});
        if (comments.length === 0) {
            return res.json("no comments found for this blog post");
        }
        res.status(202).json(comments);
    } catch(err) {
        return next(err);
    }
});

exports.comments_create = [
    body("author").trim().isLength({min: 1, max: 30}).withMessage("author's name should be between 1 and 30 characters"),
    body("content").trim().isLength({min: 3, max: 300}).withMessage("comment should be between 3 and 300 characters"),
    
    (async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(403).json({errors: errors.array()});
        }

        try {
            const blogpost = await blogPost.findById(req.params.postId);
            if (blogpost === null) {
                return res.status(403).json("no blog post with this ID was found");
            }
            const newComment = new comment({
                blogpost: blogpost,
                author: req.body.author,
                content: req.body.content,
            })
            await newComment.save();
            res.status(202).json({message: "comment successfully posted!", comment: newComment});
        } catch(err) {
            return next(err);
        }
    })
];