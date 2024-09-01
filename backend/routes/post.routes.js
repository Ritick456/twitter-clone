import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js';
import { createpost, getUserPosts, deletepost, getLikedpost, commentonpost, likeunlikepost, getallpost, getFollowingPosts } from '../controllers/post.controllers.js';

const router = express.Router();



router.delete("/:id", protectRoute, deletepost);
router.post("/create", protectRoute, createpost);
router.post("/comment/:id", protectRoute, commentonpost);
router.post("/like/:id", protectRoute, likeunlikepost);
router.get("/all", protectRoute, getallpost);
router.get("/likes/:id", protectRoute, getLikedpost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPosts);




export default router;