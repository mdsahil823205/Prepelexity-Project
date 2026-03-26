import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import socket from "../services/client.socket";
import { getChat, getMessages, deleteChat } from "../services/chat.api.js";
import {
    addNewMessage,
    appendToLastMessage,
    setChats,
    setCurrentChat,
    setIsLoading,
    setIsTyping,
    setError,
    setMessages,
    createNewChat,
    setStatusMessage,
} from "../context/chat.slice.js";

const useChat = () => {
    const dispatch = useDispatch();
    const { currentChatId } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);

    // Keep latest refs so socket listeners always have current values
    const pendingMessageRef = useRef(null);

    // ─── Register all socket listeners ONCE (not inside handleSendMessage) ───
    useEffect(() => {
        // Each token chunk → append to the streaming AI message
        const onChunk = ({ token, chatId }) => {
            dispatch(appendToLastMessage({ chatId, token }));
        };

        // Intermediate status (web search, email sending, etc.)
        const onStatus = ({ status }) => {
            dispatch(setStatusMessage(status));
        };

        // New chat was created on the server (first message in a fresh chat)
        const onChatCreated = ({ id, title }) => {
            dispatch(createNewChat({ chatId: id, title }));
            dispatch(setCurrentChat(id));
            // Add the user message + empty AI placeholder under the real chatId
            if (pendingMessageRef.current) {
                dispatch(addNewMessage({ chatId: id, content: pendingMessageRef.current, role: "user" }));
                dispatch(addNewMessage({ chatId: id, content: "", role: "ai" }));
                pendingMessageRef.current = null;
            }
        };

        // Streaming finished
        const onDone = async ({ chatId: doneChatId }) => {
            dispatch(setStatusMessage(""));
            dispatch(setCurrentChat(doneChatId));
            dispatch(setIsTyping(false));
            dispatch(setIsLoading(false));

            // Refresh sidebar chat list WITHOUT wiping current messages:
            // fetch chats, but merge them so existing messages are preserved
            try {
                const data = await getChat();
                dispatch((dispatchInner, getState) => {
                    const existingChats = getState().chat.chats;
                    const merged = {};
                    (data.chats || []).forEach((chat) => {
                        const existing = existingChats[chat._id];
                        merged[chat._id] = {
                            id: chat._id,
                            title: chat.title,
                            // Keep already-loaded messages, only default to [] for brand-new chats
                            messages: existing ? existing.messages : [],
                        };
                    });
                    dispatchInner(setChats(merged));
                });
            } catch (_) {
                // Non-critical: sidebar may not update but messages stay intact
            }
        };

        // Error handler
        const onError = ({ message: errMsg }) => {
            dispatch(setStatusMessage(""));
            dispatch(setError(errMsg));
            dispatch(setIsTyping(false));
            dispatch(setIsLoading(false));
        };

        socket.on("ai:chunk", onChunk);
        socket.on("ai:status", onStatus);
        socket.on("chat:created", onChatCreated);
        socket.on("ai:done", onDone);
        socket.on("ai:error", onError);

        return () => {
            socket.off("ai:chunk", onChunk);
            socket.off("ai:status", onStatus);
            socket.off("chat:created", onChatCreated);
            socket.off("ai:done", onDone);
            socket.off("ai:error", onError);
        };
    }, [dispatch]);

    // 1. Socket ke zariye message bhejna (real-time streaming)
    const handleSendMessage = (message, chatId) => {
        if (!message.trim()) return;

        dispatch(setIsLoading(true));
        dispatch(setIsTyping(true));

        if (chatId) {
            // Existing chat: add user message + empty AI placeholder immediately
            dispatch(addNewMessage({ chatId, content: message, role: "user" }));
            dispatch(addNewMessage({ chatId, content: "", role: "ai" }));
        } else {
            // New chat: store message so chat:created handler can add it
            pendingMessageRef.current = message;
        }

        // Emit to server
        socket.emit("sendMessage", {
            message,
            chatId: chatId || null,
            userId: user?._id || user?.id,
        });
    };

    // 2. Saari purani chats ki list mangwane ke liye
    const handleGetChat = async () => {
        try {
            dispatch(setIsLoading(true));
            const data = await getChat();
            dispatch((dispatchInner, getState) => {
                const existingChats = getState().chat.chats;
                const chatsObj = {};
                (data.chats || []).forEach((chat) => {
                    const existing = existingChats[chat._id];
                    chatsObj[chat._id] = {
                        id: chat._id,
                        title: chat.title,
                        messages: existing ? existing.messages : [],
                    };
                });
                dispatchInner(setChats(chatsObj));
            });
            dispatch(setIsLoading(false));
            return data;
        } catch (error) {
            dispatch(setError("Chats load nahi ho payi!"));
            dispatch(setIsLoading(false));
        }
    };

    // 3. Kisi specific chat ke saare messages load karne ke liye
    const handleGetMessages = async (chatId) => {
        try {
            dispatch(setIsLoading(true));
            const response = await getMessages({ chatId });
            dispatch(setMessages({ chatId, messages: response.messages || [] }));
            dispatch(setCurrentChat(chatId));
            dispatch(setIsLoading(false));
            return response;
        } catch (error) {
            dispatch(setError("Messages nahi mil rahe!"));
            dispatch(setIsLoading(false));
        }
    };

    // 4. Chat delete karne ke liye
    const handleDeleteChat = async (chatId) => {
        try {
            dispatch(setIsLoading(true));
            await deleteChat({ chatId });
            await handleGetChat();
            dispatch(setCurrentChat(null));
            dispatch(setIsLoading(false));
        } catch (error) {
            dispatch(setError("Chat delete nahi ho paayi!"));
            dispatch(setIsLoading(false));
        }
    };

    return {
        handleSendMessage,
        handleGetChat,
        handleGetMessages,
        handleDeleteChat,
    };
};

export default useChat;
