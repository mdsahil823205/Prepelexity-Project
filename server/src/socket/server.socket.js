import { Server } from "socket.io";
import { generateChatTitle, generateResponseStream, detectIntent, extractEmailDetails } from "../services/Ai.service.js";
import tavilyService from "../services/tavily.service.js";
import sendMail from "../services/mail.service.js";
import chatModel from "../model/chat.model.js";
import messageModel from "../model/message.model.js";

let io;

export const initializeSocketIO = ({ httpServer }) => {

    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("user connected:", socket.id);

        // Client emits this event when user sends a message
        socket.on("sendMessage", async ({ message, chatId, userId }) => {
            try {
                let currentChatId = chatId;

                // If no chatId, create a new chat
                if (!currentChatId) {
                    const title = await generateChatTitle(message);
                    const newChat = await chatModel.create({ user: userId, title });
                    currentChatId = newChat._id.toString();

                    // Tell the client about the new chat so it can update sidebar
                    socket.emit("chat:created", {
                        id: currentChatId,
                        title: newChat.title,
                    });
                }

                // Save user message to DB
                await messageModel.create({
                    chat: currentChatId,
                    content: message,
                    role: "user",
                });

                // Fetch full chat history for context
                const history = await messageModel
                    .find({ chat: currentChatId })
                    .sort({ createdAt: 1 });

                // ─── Intent Detection ───────────────────────────────────────
                const intent = await detectIntent(message);
                console.log(`🧠 Detected intent: ${intent}`);

                let extraContext = "";

                // ─── Web Search via Tavily ──────────────────────────────────
                if (intent === "web_search") {
                    socket.emit("ai:status", { status: "🔍 Searching the internet..." });
                    const searchResults = await tavilyService(message);
                    extraContext = `[Web Search Results for: "${message}"]\n\n${searchResults}`;
                    console.log("Tavily search done.");
                }

                // ─── Send Email ─────────────────────────────────────────────
                if (intent === "send_email") {
                    socket.emit("ai:status", { status: "📧 Extracting email details..." });
                    const emailDetails = await extractEmailDetails(message);

                    let emailReply = "";

                    if (emailDetails && emailDetails.to) {
                        socket.emit("ai:status", { status: `📤 Sending email to ${emailDetails.to}...` });
                        try {
                            await sendMail({
                                to: emailDetails.to,
                                subject: emailDetails.subject || "Message from AI Assistant",
                                html: `<p>${emailDetails.body}</p>`,
                                text: emailDetails.body,
                            });
                            emailReply = `✅ Email sent successfully!\n\n**To:** ${emailDetails.to}\n**Subject:** ${emailDetails.subject || "Message from AI Assistant"}\n**Message:** ${emailDetails.body}`;
                        } catch (mailError) {
                            console.error("Failed to send email:", mailError);
                            emailReply = `❌ Failed to send the email to ${emailDetails.to}. Please check your email configuration and try again.`;
                        }
                    } else {
                        emailReply = "❌ I couldn't find a valid email address in your message. Please include the recipient's email and try again.\n\nExample: *Send an email to example@gmail.com saying Hello!*";
                    }

                    // Emit the email result directly — do NOT call Gemini for this
                    socket.emit("ai:status", { status: "" }); // Clear status
                    socket.emit("ai:chunk", { token: emailReply, chatId: currentChatId });

                    const aiMessage = await messageModel.create({
                        chat: currentChatId,
                        content: emailReply,
                        role: "ai",
                    });

                    socket.emit("ai:done", { chatId: currentChatId, message: aiMessage });
                    return; // ← Stop here, skip the AI streaming below
                }

                // ─── Stream AI Response ─────────────────────────────────────
                socket.emit("ai:status", { status: "" }); // Clear status
                const stream = await generateResponseStream(history, extraContext);
                let fullResponse = "";

                for await (const chunk of stream) {
                    const token = chunk.content;
                    if (token) {
                        fullResponse += token;
                        socket.emit("ai:chunk", { token, chatId: currentChatId });
                    }
                }

                // Save the complete AI response to DB
                const aiMessage = await messageModel.create({
                    chat: currentChatId,
                    content: fullResponse,
                    role: "ai",
                });

                // Notify client that streaming is complete
                socket.emit("ai:done", { chatId: currentChatId, message: aiMessage });

            } catch (error) {
                console.error("Socket sendMessage error:", error);
                socket.emit("ai:error", { message: "Something went wrong. Please try again." });
            }
        });

        socket.on("disconnect", () => {
            console.log("user disconnected:", socket.id);
        });
    });

};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
};