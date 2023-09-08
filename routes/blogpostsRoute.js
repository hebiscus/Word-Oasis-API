const express = require("express");
const router = express.Router();
const blogPostController = require("../controllers/blogPostsController");
const passport = require("passport");

router.get("/", blogPostController.posts_get);

router.post("/", passport.authenticate('jwt', { session: false }), blogPostController.posts_create);

router.get("/:postId", blogPostController.onePost_get);

router.put("/:postId/update", passport.authenticate('jwt', { session: false }), blogPostController.onePost_update);

router.delete("/:postId/delete", passport.authenticate('jwt', { session: false }), blogPostController.onePost_delete);

router.get("/:postId/comments", blogPostController.comments_get);

router.post("/:postId/comments", blogPostController.comments_create);

router.delete("/comments/:commentId/delete", blogPostController.comment_delete);

module.exports = router;