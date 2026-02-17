import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_REACT_APP_BACKEND_BASEURL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Connected to socket server:");
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

export default socket;