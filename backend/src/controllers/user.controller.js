import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { streamClient } from "../config/stream.js";
import asyncHandler from "express-async-handler";
import Notification from "../models/notification.model.js";
import { sendToClerkIds } from "../utils/push.js";

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
		
		// --- FIX: Extract first and last name from Clerk user object ---
		const firstName = clerkUser.firstName;
		const lastName = clerkUser.lastName;
		const profileImage = clerkUser.imageUrl;

		const dbUser = await User.findOneAndUpdate(
			{ clerkId: userId },
			{
				$set: {
					clerkId: userId,
					email,
					username,
					// --- FIX: Add firstName and lastName to the database record ---
					firstName,
					lastName,
					profileImage,
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);

		// Retry wrapper for transient Stream errors (e.g., 429/5xx)
		const retry = async (fn, { retries = 3, baseDelayMs = 300 } = {}) => {
			let attempt = 0;
			let lastErr;
			while (attempt <= retries) {
				try {
					return await fn();
				} catch (err) {
					lastErr = err;
					const status = err?.response?.status;
					const isRetryable = status === 429 || (status >= 500 && status < 600) || !status;
					if (!isRetryable || attempt === retries) break;
					const delay = baseDelayMs * 2 ** attempt + Math.floor(Math.random() * 100);
					await new Promise((r) => setTimeout(r, delay));
					attempt += 1;
				}
			}
			throw lastErr;
		};

		try {
			await retry(() => streamClient.upsertUser({
				id: userId,
				name: `${firstName ?? ""} ${lastName ?? ""}`.trim() || username,
				image: profileImage,
			}));
		} catch (streamErr) {
			const status = streamErr?.response?.status;
			const statusText = streamErr?.response?.statusText;
			console.error("⚠️ Stream upsertUser failed, proceeding without blocking sync:", {
				message: streamErr?.message,
				status,
				statusText,
			});
		}

		console.log(`✅ User synced successfully: ${dbUser.username} (${dbUser.clerkId})`);
		res.status(200).json(dbUser);
	} catch (error) {
		const status = error?.response?.status;
		const statusText = error?.response?.statusText;
		console.error("❌ Error syncing user:", {
			message: error?.message,
			status,
			statusText,
			code: error?.code,
			path: "/api/users/sync",
		});
		res.status(status && status >= 500 ? 503 : 500).json({ message: "Something went wrong during user sync!" });
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
		const { username } = req.params;
		const user = await User.findOne({ username });
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
			// Create follow notification and push
			try {
				await Notification.create({ from: currentUser._id, to: userToFollow._id, type: "follow" });
				await sendToClerkIds({
					clerkIds: [userToFollow.clerkId],
					title: `${currentUser.username || "Someone"} started following you`,
					body: "Tap to view their profile",
					type: "follow",
					data: { type: "follow", userId: currentUser.clerkId },
				});
			} catch {}
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

		try {
			await streamClient.partialUpdateUser({
				id: req.auth.userId,
				set: {
					name: user.username,
				},
			});
		} catch (streamErr) {
			console.error("⚠️ Stream partialUpdateUser failed, continuing:", {
				message: streamErr?.message,
				status: streamErr?.response?.status,
				statusText: streamErr?.response?.statusText,
			});
		}

		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// --- Push helpers in user controller for convenience ---
export const savePushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });
  const user = await User.findOneAndUpdate({ clerkId: req.auth.userId }, { $set: { pushToken: token } }, { new: true });
  if (!user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({ pushToken: user.pushToken });
});

export const setPushPreferences = asyncHandler(async (req, res) => {
  const { enabled, preferences } = req.body;
  const user = await User.findOne({ clerkId: req.auth.userId });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (typeof enabled === "boolean") user.pushNotificationsEnabled = enabled;
  if (preferences && typeof preferences === "object") {
    user.notificationPreferences = { ...user.notificationPreferences, ...preferences };
  }
  await user.save();
  res.status(200).json({ enabled: user.pushNotificationsEnabled, preferences: user.notificationPreferences });
});