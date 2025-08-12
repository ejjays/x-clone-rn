import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import https from "https";

if (!ENV.STREAM_API_KEY || !ENV.STREAM_SECRET_KEY) {
  throw new Error("Stream API key and secret must be provided in your .env file.");
}

// Use a keep-alive agent to speed up TLS handshakes and reduce transient network errors
const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
  keepAliveMsecs: 10_000,
});

// Initialize and export the single Stream Chat client instance with sane defaults
export const streamClient = StreamChat.getInstance(
  ENV.STREAM_API_KEY,
  ENV.STREAM_SECRET_KEY,
  {
    timeout: Number(process.env.STREAM_HTTP_TIMEOUT_MS) || 10_000,
    httpsAgent,
  }
);