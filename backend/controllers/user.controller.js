import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

//controller for getting user profile
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("error in getUserProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};

//controller for following and unfollowing a user
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res.status(500).json({ error: "you cant follow yourself" });
    }

    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unFollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      //TODO: return the id of the user as a response

      res.status(200).json({ message: "user unfollowed successfully" });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();
      //TODO: return the id of the user as a response
      res.status(200).json({ message: "user followed successfully" });
    }
  } catch (error) {
    console.log("error in followUnfollowUser", error.message);
    res.status(500).json({ error: error.message });
  }
};

//controller for getting suggested users
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 10);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("error in getSuggestedUsers", error.message);
    res.status(500).json({ error: error.message });
  }
};

//controller for updating user
export const updateUser = async (req, res) => {
  const { fullName, username, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImage, coverImage } = req.body;

  try {
    const userId = req.user._id;
    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Handle password update
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle profile image upload
    if (profileImage) {
      try {
        if (user.profileImage) {
          await cloudinary.uploader.destroy(
            user.profileImage.split("/").pop().split(".")[0]
          );
        }
        const result = await cloudinary.uploader.upload(profileImage);
        user.profileImage = result.secure_url;
      } catch (err) {
        console.error("Error uploading profile image:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to upload profile image" });
      }
    }

    // Handle cover image upload
    if (coverImage) {
      try {
        if (user.coverImage) {
          await cloudinary.uploader.destroy(
            user.coverImage.split("/").pop().split(".")[0]
          );
        }
        const result = await cloudinary.uploader.upload(coverImage);
        user.coverImage = result.secure_url;
      } catch (err) {
        console.error("Error uploading cover image:", err.message);
        return res.status(500).json({ error: "Failed to upload cover image" });
      }
    }

    // Update user details
    user.fullName = fullName || user.fullName;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user.toObject();

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Error in updateUser:", error.message);
    res.status(500).json({ error: error.message });
  }
};
