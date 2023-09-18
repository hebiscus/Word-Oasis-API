const blogPost = require("../models/blogPost");
const comment = require("../models/comment");
const { body, validationResult } = require("express-validator");
const uploadToCloudinary = require("../middleware/cloudinary");

exports.posts_get = (async (req, res, next) => {
    const {title, limit, sorting} = req.query;
    const sortingValue = sorting === "ascending" ? 1 : -1; 

    try {
        if (title) {
            const foundPost = await blogPost.findOne({title : title});
            if (!foundPost) {
                return res.status(403).json({message: "no blog post with such title was found", foundPost});
            }
            return res.status(200).json({message: "blog post was found!", foundPost});
        }
        if (sorting) {
            const foundPosts = await blogPost.find().limit(limit || 0).sort({creationDate: sortingValue});
            if (foundPosts.length === 0) {
                return res.status(403).json({message: "no blog posts available yet", foundPosts});
            }
            return res.status(200).json({message: "found some sorted blog posts!", foundPosts});
        }
        const foundPosts = await blogPost.find().skip(1).limit(limit || 0);
        console.log(foundPosts)
        if (foundPosts.length === 0) {
            return res.status(403).json({message: "no blog posts available yet", foundPosts});
        }
        res.status(200).json({message: "found some blog posts!", foundPosts});
    } catch(err) {
        return next(err);
    }
});

exports.posts_create = [
    body("title").trim().isLength({min: 2, max: 80}).withMessage("title should be between 2 and 80 characters"),
    body("content").isArray({min: 1, max: 15}).withMessage("blog post should be between 2 and 30 000 characters, 2000 characters max for each paragraph"),
    body("status").isIn(["unpublished", "published"]).withMessage("invalid status value"),
    body("creationDate").isISO8601(),
    
    (async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(403).json({errors: errors.array()})
        }
        try {
            if (!req.file) {
                const newPost = new blogPost({
                    author: req.user,
                    title: req.body.title,
                    content: req.body.content,
                    status: req.body.status,
                    imageURL: "",
                    creationDate: req.body.creationDate,
                })
                await newPost.save();
                res.status(200).json("successfully created a blog post!")
            } else {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                const image = await uploadToCloudinary(dataURI, "blogpostImage");
                const newPost = new blogPost({
                    author: req.user,
                    title: req.body.title,
                    content: req.body.content,
                    status: req.body.status,
                    imageURL: image.url,
                    creationDate: req.body.creationDate,
                })
                await newPost.save();
                res.status(200).json("successfully created a blog post!")
            }
        } catch(err) {
            return next(err);
        }
    })
];

exports.onePost_get = (async (req, res, next) => {
    try {
        const blogpost = await blogPost.findById(req.params.postId).populate("author").exec();
        if (blogpost === null) {
            return res.json({message: "no blog post with this ID was found", blogpost});
        }
        res.status(202).json({message: "blog post was found!", blogpost});
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
        return next(err);
    }
})

exports.comments_get = (async (req, res, next) => {
    try {
        const comments = await comment.find({blogpost: req.params.postId});
        if (comments.length === 0) {
            return res.status(403).json({comments, message:"no comments found for this blog post"});
        }
        res.status(202).json({comments, message:"comments were found"});
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

exports.comment_delete = (async (req, res, next) => {
    try {
        const foundComment = await comment.findByIdAndDelete(req.params.commentId);
        if (foundComment == null) {
            return res.status(403).json({message: "no comment with this ID was found", comment: null});
        }
        res.status(202).json({message: "comment was found!", comment: foundComment});
    } catch(err) {
        return next(err);
    }
})