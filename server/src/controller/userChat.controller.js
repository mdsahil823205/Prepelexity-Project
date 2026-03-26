import { generateChatTitle, generateResponse } from "../services/Ai.service.js";
import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";

// send chat to ai from user
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("Incoming chatId:", chatId);

    let currentChatId = chatId;
    let title = null;
    let chat = null;

    //  Create new chat only if chatId not provided
    if (!currentChatId) {
      title = await generateChatTitle(message);
      console.log(title)
      chat = await chatModel.create({
        user: userId || req.user.id,
        title: title,
      });

      currentChatId = chat._id;
    }

    // ✅ Save user message
    const userMessage = await messageModel.create({
      chat: currentChatId,
      content: message,
      role: "user",
    });

    // ✅ Get chat history (sorted)
    const messages = await messageModel
      .find({ chat: currentChatId })
      .sort({ createdAt: 1 });

    // ✅ Generate AI response
    const response = await generateResponse(messages);

    // ✅ Save AI response
    const AIMessage = await messageModel.create({
      chat: currentChatId,
      content: response,
      role: "ai",
    });

    // ✅ Final response
    res.status(201).json({
      success: true,
      userMessage,
      chatId: currentChatId,
      AIMessage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// get all chats of user
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await chatModel.find({ user: userId });
    res.status(200).json({
      success: true,
      message: "all chats fetched successfully",
      chats,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
export const getAllMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await messageModel.find({ chat: chatId });
    res.status(200).json({
      success: true,
      message: "messages fetched successfully",
      messages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const chat = await chatModel.findByIdAndDelete(chatId);
    const messages = await messageModel.deleteMany({ chat: chatId });
    console.log(chat);
    console.log(messages);
    res.status(200).json({
      success: true,
      message: "chat deleted successfully",
      chat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
