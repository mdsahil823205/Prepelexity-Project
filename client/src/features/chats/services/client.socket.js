import { io } from "socket.io-client";

// Singleton — created once, shared everywhere
const socket = io("https://prepelexity-project.onrender.com", {
    withCredentials: true,
    autoConnect: true,
});

socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO server:", socket.id);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from Socket.IO server");
});

export default socket;
