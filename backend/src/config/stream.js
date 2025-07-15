import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

if (!ENV.STREAM_API_KEY || !ENV.STREAM_SECRET_KEY) {
  throw new Error("Stream API key and secret must be provided in your .env file.");
}

// Initialize and export the single Stream Chat client instance
export const streamClient = StreamChat.getInstance(
  ENV.STREAM_API_KEY,
  ENV.STREAM_SECRET_KEY
);