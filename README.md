<h1 align="left">📱 PCMI - Infanta's Official Application 🚀</h1>

![Demo App](/mobile/assets/images/screenshot-for-readme.png)

Welcome to the **PCMI Official Application**! This is a social media app designed for our church family here at Infanta, Quezon. It provides a platform for our church members to connect, share, and engage with each other through various features.

This application is built with a robust backend using Node.js, Express, and MongoDB, and a mobile frontend developed with React Native and Expo.

---

## ✨ Features

*   **User Authentication:** Secure user registration and login powered by Clerk.
*   **Social Feed:** Users can create and view posts, with support for images and videos.
*   **Media Uploads:** Posts now upload media to ImageKit (storage/bandwidth based). Chat media continues to use Cloudinary.
*   **Interactions:** Engage with posts through liking, commenting, and reactions.
*   **Real-time Chat:** Private and group messaging functionality using Stream Chat.
*   **Notifications:** Stay updated with real-time notifications for likes, comments, and new messages.
*   **Video Playback:** Watch videos directly within the application.
*   **Profile Management:** Users can manage their profiles.

## 💻 Technologies Used

**Backend:**

*   Node.js
*   Express
*   MongoDB (via Mongoose)
*   Clerk (Authentication)
*   Cloudinary (Uploads for chat attachments)
*   ImageKit (Uploads for feed post media)
*   Pusher (Real-time features)
*   Stream Chat (Messaging)

**Mobile (React Native with Expo):**

*   React Native
*   Expo
*   Clerk (Authentication)
*   Stream Chat (Messaging)
*   Various libraries for image handling, video playback, and UI components.

---

## ⚙️ Environment Configuration

Set the following environment variables:

### Backend (`backend/.env`)

- `MONGODB_URI`
- `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- `STREAM_API_KEY`, `STREAM_SECRET_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (retained for chat uploads)
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` (new for post uploads)
- Optional: `PORT` (default 8080), `EXTERNAL_BASE_URL` (for Stream webhook), `ARCJET_KEY`

### Mobile (Expo)

- `EXPO_PUBLIC_API_URL` (e.g. `http://YOUR_LAN_IP:8080/api`)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_STREAM_API_KEY`
- `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME`

Notes:
- Post creation uses ImageKit via a signed auth handshake from the backend (`GET /api/upload/imagekit/auth`).
- Chat continues to use Cloudinary for media attachments.

---