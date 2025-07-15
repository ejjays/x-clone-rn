import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { streamClient } from "../config/stream.js";

/**
 * @description Sync user from Clerk to the database and Stream
 * @route POST /api/users/sync
 */
export const syncUser = async (req, res) => {
	if (!req.auth || !req.auth.userId) {
		console.error("Sync Error: Unauthorized - No auth object or userId on request.");
		return res.status(401).json({ message: "Unauthorized" });
	}

	const { userId } = req.auth;

	try {
		const clerkUser = await clerkClient.users.getUser(userId);

		if (!clerkUser) {
			console.error(`Sync Error: Clerk user with ID ${userId} not found.`);
			return res.status(404).json({ message: "User not found in Clerk" });
		}

		const email = clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress;
		const username = clerkUser.username || `user_${userId.slice(5, 12)}`;
		const profileImage = clerkUser.imageUrl;

		const dbUser = await User.findOneAndUpdate(
			{ clerkId: userId },
			{
				$set: {
					clerkId: userId,
					email,
					username,
					profileImage,
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		await streamClient.upsertUser({
			id: userId,
			name: username,
			image: profileImage,
		});

		console.log(`✅ User synced successfully: ${dbUser.username} (${dbUser.clerkId})`);
		res.status(200).json(dbUser);
	} catch (error) {
		console.error("❌ Error syncing user:", error);
		res.status(500).json({ message: "Something went wrong during user sync!" });
	}
};

/**
 * @description Get all users
 * @route GET /api/users
 */
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find({ clerkId: { $ne: req.auth.userId } });
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * @description Get user by ID
 * @route GET /api/users/:userId
 */
export const getUserById = async (req, res) => {
	try {
		const user = await User.findOne({ clerkId: req.params.userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });

		res.status(200).json({ user, posts });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * @description Get current user
 * @route GET /api/users/me
 */
export const getCurrentUser = async (req, res) => {
	try {
		const user = await User.findOne({ clerkId: req.auth.userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * @description Follow/unfollow user
 * @route POST /api/users/follow/:userId
 */
export const followUnfollowUser = async (req, res) => {
	try {
		const userToFollow = await User.findOne({ clerkId: req.params.userId });
		const currentUser = await User.findOne({ clerkId: req.auth.userId });

		if (!userToFollow || !currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		if (req.params.userId === req.auth.userId) {
			return res.status(400).json({ message: "You cannot follow yourself" });
		}

		const isFollowing = currentUser.following.includes(userToFollow._id);

		if (isFollowing) {
			// Unfollow user
			await User.updateOne({ _id: currentUser._id }, { $pull: { following: userToFollow._id } });
			await User.updateOne({ _id: userToFollow._id }, { $pull: { followers: currentUser._id } });
			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow user
			await User.updateOne({ _id: currentUser._id }, { $push: { following: userToFollow._id } });
			await User.updateOne({ _id: userToFollow._id }, { $push: { followers: currentUser._id } });
			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

/**
 * @description Update user profile
 * @route PUT /api/users/profile
 */
export const updateUserProfile = async (req, res) => {
	const { username, bio, profileImage: newProfileImage, coverImage: newCoverImage } = req.body;

	try {
		const user = await User.findOne({ clerkId: req.auth.userId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.profileImage = newProfileImage || user.profileImage;
		user.coverImage = newCoverImage || user.coverImage;

		await user.save();

		await clerkClient.users.updateUser(req.auth.userId, {
			username: user.username,
			publicMetadata: {
				bio: user.bio,
			},
		});

		await streamClient.partialUpdateUser({
			id: req.auth.userId,
			set: {
				name: user.username,
			},
		});

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};