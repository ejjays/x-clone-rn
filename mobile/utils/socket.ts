import { io } from "socket.io-client";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001";

export const socket = io(API_BASE_URL);