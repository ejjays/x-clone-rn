import { StyleSheet } from "react-native";

export const videosScreenStyles = StyleSheet.create({
	centered: {
		flex: 1,
		backgroundColor: "black",
		justifyContent: "center",
		alignItems: "center",
	},
	infoText: { color: "white", fontSize: 16, marginTop: 10 },
	header: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		paddingHorizontal: 16,
		paddingBottom: 10,
		zIndex: 10,
		backgroundColor: "transparent",
		alignItems: "center",
	},
	headerTitle: { fontSize: 28, fontWeight: "bold", color: "white" },
	iconShadow: {
		textShadowColor: "black",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 7,
	},
});

export const videoItemStyles = StyleSheet.create({
	videoContainer: {
		backgroundColor: "black",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	videoWrapper: {
		width: '100%',
		backgroundColor: 'black',
		position: 'relative',
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		flexDirection: "row",
		justifyContent: "space-between",
		zIndex: 5,
		alignItems: "flex-end",
	},
	leftContainer: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "flex-start",
		paddingLeft: 0,
		paddingRight: 10,
	},
	rightContainer: {
		justifyContent: "flex-end",
		alignItems: "center",
		paddingHorizontal: 3,
	},
	userInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "white",
		marginRight: 10,
	},
	username: { color: "white", fontWeight: "bold", fontSize: 16 },
	caption: { color: "white", fontSize: 14 },
	iconContainer: { alignItems: "center", marginBottom: 5 },
	iconText: { color: "white", fontSize: 12, marginTop: 5 },
	iconShadow: {
		textShadowColor: "black",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 7,
	},
});

