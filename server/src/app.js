import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"))
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

import AuthRouter from "./routes/auth.route.js";
app.use("/api/auth", AuthRouter);

import ChatRouter from "./routes/chats.route.js";
app.use("/api/chats", ChatRouter);

export default app;
