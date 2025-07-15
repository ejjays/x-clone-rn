import { clerkClient } from "@clerk/express";
import { streamClient } from "../config/stream.js";
import User from "../models/user.model.js";

export const getStreamToken = async (req, res) => {
	try {
		const { userId } = req.auth;

		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		const user = await User.findOne({ clerkId: userId }).select("firstName lastName profilePicture");

		if (!user) {
			return res.status(404).json({ error: "User not found in database" });
		}

		const token = streamClient.createToken(userId);

		const streamUser = {
			id: userId,
			name: `${user.firstName} ${user.lastName}`,
			image: user.profilePicture,
		};

		res.json({
			token,
			user: streamUser,
		});
	} catch (error) {
		console.error("❌ Error generating Stream token:", error);
		res.status(500).json({
			error: "Failed to generate Stream token",
			details: error.message,
		});
	}
};

export const createChannel = async (req, res) => {
	try {
		const { userId } = req.auth;
		const { type = "messaging", members = [] } = req.body;

		const otherMemberId = members.find((member) => member !== userId);

		if (!userId || !otherMemberId) {
			return res.status(400).json({ error: "Both user IDs are required to create a channel." });
		}

		const [currentUserClerk, otherUserClerk] = await Promise.all([
			clerkClient.users.getUser(userId),
			clerkClient.users.getUser(otherMemberId),
		]);

		await streamClient.upsertUsers([
			{
				id: currentUserClerk.id,
				name: `${currentUserClerk.firstName} ${currentUserClerk.lastName}`,
				image: currentUserClerk.imageUrl,
			},
			{
				id: otherUserClerk.id,
				name: `${otherUserClerk.firstName} ${otherUserClerk.lastName}`,
				image: otherUserClerk.imageUrl,
			},
		]);

		const channelName =
			`Conversation with ${otherUserClerk.firstName} ${otherUserClerk.lastName}` || `Channel with ${otherMemberId}`;

		const channel = streamClient.channel(type, {
			name: channelName,
			members: [userId, otherMemberId],
			created_by_id: userId,
		});

		await channel.create();

		res.status(201).json({ channelId: channel.id });
	} catch (error) {
		console.error("❌ Error creating channel:", error);
		res.status(500).json({
			error: "Failed to create channel",
			details: error.message,
		});
	}
};

export const getChannels = async (req, res) => {
	try {
		const { userId } = req.auth;

		if (!userId) {
			return res.status(400).json({ error: "User ID is required" });
		}

		const filter = { members: { $in: [userId] } };
		const sort = { last_message_at: -1 };
		const options = { limit: 30 };

		const channels = await streamClient.queryChannels(filter, sort, options);

		const channelData = channels.map((channel) => ({
			id: channel.id,
			type: channel.type,
			name: channel.data.name,
			members: channel.state.members,
			last_message_at: channel.state.last_message_at,
			member_count: channel.state.member_count,
		}));

		res.json({
			channels: channelData,
		});
	} catch (error) {
		console.error("❌ Error fetching channels:", error);
		res.status(500).json({
			error: "Failed to fetch channels",
			details: error.message,
		});
	}
};