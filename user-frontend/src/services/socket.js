import { io } from "socket.io-client";

export const socket = io("https://api-ajride.delightcoders.com", {
  transports: ["websocket"],
  withCredentials: true,
});

// 🔍 Debug logs
socket.on("connect", () => {
  console.log("✅ [SOCKET] Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("❌ [SOCKET] Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("⚠️ [SOCKET] Connection Error:", err.message);
});
