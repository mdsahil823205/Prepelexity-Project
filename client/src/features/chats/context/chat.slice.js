import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chats: {}, // Saare chats yahan object form mein honge
    currentChatId: null, // Jo chat screen par open hai
    isLoading: false, // Loading indicator ke liye
    isTyping: false, // AI streaming indicator ke liye
    statusMessage: "", // Intermediate status (e.g. searching web, sending email)
    error: null, // Error message store karne ke liye
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        // 1. Naya chat create karne ke liye
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload;
            state.chats[chatId] = {
                id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            };
        },
        // 2. Ek single message add karne ke liye (User ya AI ka)
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload;
            if (state.chats[chatId]) {
                state.chats[chatId].messages.push({ content, role });
                state.chats[chatId].lastUpdated = new Date().toISOString();
            }
        },
        // 3. Poori message history ek saath update karne ke liye
        setMessages: (state, action) => {
            const { chatId, messages } = action.payload;
            if (state.chats[chatId]) {
                state.chats[chatId].messages = messages;
            }
        },
        // 4. Sabhi chats ko backend se load karke state mein daalne ke liye
        setChats: (state, action) => {
            state.chats = action.payload;
        },
        // 5. Active chat ID set karne ke liye
        setCurrentChat: (state, action) => {
            state.currentChatId = action.payload;
        },
        // 6. Loading status handle karne ke liye
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        // 7. Error handle karne ke liye
        setError: (state, action) => {
            state.error = action.payload;
        },
        // 8. AI streaming indicator (typing effect)
        setIsTyping: (state, action) => {
            state.isTyping = action.payload;
        },
        // 9. Streaming token ko last AI message mein append karne ke liye
        appendToLastMessage: (state, action) => {
            const { chatId, token } = action.payload;
            const chat = state.chats[chatId];
            if (!chat) return;
            const messages = chat.messages;
            if (messages.length === 0) return;
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "ai") {
                lastMsg.content += token;
            }
        },
        // 10. Status message (e.g. "Searching internet...")
        setStatusMessage: (state, action) => {
            state.statusMessage = action.payload;
        },
    },
});

// Saare actions ko export karna zaroori hai taaki components mein use ho sakein
export const {
    createNewChat,
    addNewMessage,
    setMessages,
    setChats,
    setCurrentChat,
    setIsLoading,
    setError,
    setIsTyping,
    appendToLastMessage,
    setStatusMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
