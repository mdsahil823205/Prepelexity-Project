import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/config/dbconnect.js";
import { initializeSocketIO } from "./src/socket/server.socket.js";
import { createServer } from "http";

// create http server
const httpServer = createServer(app);

// initialize socket.io
initializeSocketIO({ httpServer });

// start server after database connection
const startServer = async () => {
    try {
        await connectDB();
        console.log("Database connected successfully");

        const PORT = process.env.PORT || 3000;

        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();