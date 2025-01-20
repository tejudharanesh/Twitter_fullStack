import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

// Controller for creating a new post
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;

    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "Please provide text or image" });
    }

    if (img) {
      const result = await cloudinary.uploader.upload(img);
      img = result.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      image: img,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error during createPost", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for liking and unliking a post
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      await Post.updateOne(
        { _id: postId }, // Find the post by its ID
        { $pull: { likes: userId } } // Remove userId from the likes array
      );
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      const updatedLikes = isLiked
        ? post.likes.filter((id) => id.toString() !== userId.toString())
        : post.likes;

      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const newNotification = new Notification({
        type: "like",
        from: userId,
        to: post.user,
      });

      await newNotification.save();
      const updatedLikes = post.likes;

      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.log("Error during likeUnlikePost", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for commenting on a post
export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Please provide text" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      text,
      user: userId,
    };

    post.comments.push(newComment);
    await post.save();

    const updatedComments = post.comments;

    res.status(201).json(updatedComments);
  } catch (error) {
    console.log("Error during commentPost", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for deleting a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "you are not authorized to delete this post" });
    }
    if (post.image) {
      const imageId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error during deletePost", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error during getAllPosts", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting liked posts
export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error during getLikedPosts", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting following posts
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error during getFollowingPosts", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Controller for getting user posts
export const getUserPosts = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error during getUserPosts", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
