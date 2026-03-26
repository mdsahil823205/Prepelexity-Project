import axios from "axios";

// 1. Axios Instance Setup
export const Api = axios.create({
    baseURL: "http://localhost:3000/api/chats",
    withCredentials: true, // Cookies aur Session ke liye zaroori hai
    headers: {
        "Content-Type": "application/json",
    }
});

/**
 * 2. Message Bhejne ke liye
 * @param {string} message - User ka message
 * @param {string} chatId - Agar purani chat hai toh ID, warna null
 */
export const sendMessage = async ({ message, chatId }) => {
    try {
        const response = await Api.post("/message", { message, chatId });
        return response.data; // Expected: { chat, aiMessage }
    } catch (error) {
        console.error("API Error [sendMessage]:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * 3. Saari Chats ki list lene ke liye
 */
export const getChat = async () => {
    try {
        const response = await Api.get("/getallchats");
        return response.data; // Expected: Array of chats [{_id, title...}]
    } catch (error) {
        console.error("API Error [getChat]:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * 4. Kisi specific chat ke saare messages load karne ke liye
 */
export const getMessages = async ({ chatId }) => {
    try {
        if (!chatId) throw new Error("Chat ID is required");
        const response = await Api.get(`/${chatId}/getmessages`);
        return response.data; // Expected: Array of messages
    } catch (error) {
        console.error("API Error [getMessages]:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * 5. Chat delete karne ke liye
 */
export const deleteChat = async ({ chatId }) => {
    try {
        const response = await Api.delete(`/${chatId}/delete`);
        return response.data;
    } catch (error) {
        console.error("API Error [deleteChat]:", error.response?.data || error.message);
        throw error;
    }
};
