import express from "express";
import { deleteChat, getAllMessages, getChats, sendMessage } from "../controller/userChat.controller.js";
import isAuthMiddleware from "../middleware/isAuth.middleware.js";

const chatRouter = express.Router();
chatRouter.post("/message", isAuthMiddleware, sendMessage);
chatRouter.get("/getallchats", isAuthMiddleware, getChats);
chatRouter.get("/:chatId/getmessages", isAuthMiddleware, getAllMessages);
chatRouter.delete("/:chatId/delete", isAuthMiddleware, deleteChat);

export default chatRouter;
