import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown"; // Markdown render karne ke liye
import remarkGfm from "remark-gfm"; // GitHub style markdown
import useChat from "../hooks/useChat.js"; // Chat logic hook
import { useSelector, useDispatch } from "react-redux"; // Redux hooks
import { setCurrentChat } from "../context/chat.slice"; // Redux action
import useAuth from "../../auth/hooks/useAuth.js"; // Auth hook
import { MdDelete } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";
import { MdOutlineLightMode } from "react-icons/md";
import { IoIosLogOut } from "react-icons/io";
import { RiChatNewFill } from "react-icons/ri";
import { IoMdSend } from "react-icons/io";
import { IoIosSend } from "react-icons/io";
const Dashboard = () => {
  // 🔹 Chat functions (custom hook)
  const {
    handleSendMessage,
    handleGetChat,
    handleGetMessages,
    handleDeleteChat,
  } = useChat();

  // 🔹 Logout
  const { handleLogout } = useAuth();
  const logoutHandle = () => {
    handleLogout();
  };

  const dispatch = useDispatch();

  // 🔹 Redux state
  const { chats, currentChatId } = useSelector((state) => state.chat);
  const currentChat = chats[currentChatId];
  const messages = currentChat?.messages || [];

  // 🔹 Input state
  const [chatInput, setChatInput] = useState("");

  // 🔹 Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🔹 Scroll reference
  const messagesEndRef = useRef(null);

  // 🔹 Dark mode state (localStorage se)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  // 🔹 User data
  const { user } = useSelector((state) => state.auth);

  // 🔹 Typing (streaming) indicator
  const { isTyping, statusMessage } = useSelector((state) => state.chat);

  // 🔹 Theme apply
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 🔹 Socket initializes automatically as a singleton (no useEffect needed)

  // 🔹 Load chats on start
  useEffect(() => {
    handleGetChat();
  }, []);

  // 🔹 Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    handleSendMessage(chatInput.trim(), currentChatId);
    setChatInput("");
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <main className="fixed inset-0 p-2 md:p-5 font-sans transition-colors duration-300 bg-[#ffffff] dark:bg-[#19191a] text-slate-900 dark:text-white">
        <div className="flex h-full w-full gap-0 md:gap-4">
          {/* 🔹 Sidebar */}
          <aside
            className={`
            fixed inset-y-0 left-0 z-50 w-72 transform p-6 transition-all duration-300 ease-in-out border-r
            bg-[#f9f9f9] dark:bg-[#0e0e0e] border-slate-300 dark:border-white/5
            md:relative md:flex md:translate-x-0 md:rounded-3xl md:border
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
          >
            <div className="flex h-full w-full flex-col">
              {/* 🔹 Header */}
              <div className="flex items-center justify-between mb-8 px-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  Perplexity
                </h1>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="md:hidden text-slate-400"
                >
                  ✕
                </button>
              </div>

              {/* 🔹 New Thread */}
              <button
                onClick={() => dispatch(setCurrentChat(null))}
                className="mb-6 flex items-center justify-center gap-2 w-full rounded-xl py-4 text-sm font-semibold transition bg-gray-800 text-white dark:bg-white/10 hover:bg-gray-900 dark:hover:bg-white/20 active:scale-99"
              >
                <RiChatNewFill className="text-lg" /> New Thread
              </button>

              {/* 🔹 Chats list */}
              <nav className="flex-1 space-y-1 overflow-y-auto">
                {Object.values(chats).map((chat) => (
                  <div
                    key={chat.id}
                    className="group relative flex items-center rounded-lg transition hover:bg-slate-200 dark:hover:bg-white/5 active:scale-99"
                  >
                    {/* Open chat */}
                    <button
                      onClick={() => handleGetMessages(chat.id)}
                      className="flex-1 truncate px-3 py-2 text-left text-sm text-slate-600 dark:text-white/60"
                    >
                      {chat.title}
                    </button>

                    {/* Delete chat */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      title="Delete chat"
                      className="mr-1 shrink-0 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </nav>

              {/* 🔹 Bottom buttons */}
              <div className="mt-auto space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
                {/* Dark mode toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/5 transition"
                >
                  <span>
                    {darkMode ? (
                      <MdOutlineLightMode className="text-lg text-yellow-300" />
                    ) : (
                      <MdDarkMode className="text-lg" />
                    )}
                  </span>
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                {/* Logout */}
                <button
                  className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
                  onClick={logoutHandle}
                >
                  <IoIosLogOut className="text-lg" /> Logout
                </button>
              </div>
            </div>
          </aside>

          {/* 🔹 Chat Area */}
          <section className=" relative flex flex-1 flex-col overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl transition-all border bg-[#f9f9f9] dark:bg-[#0e0e0e] border-slate-200 dark:border-white/5">
            {/* Header */}
            <header className="flex items-center justify-between border-b p-4 px-6 border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2 backdrop-blur-md">
              {/* Sidebar button */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-lg p-2 md:hidden bg-slate-200 dark:bg-white/5 mr-4"
                >
                  <div className="space-y-1">
                    <div className="h-0.5 w-5 bg-slate-600 dark:bg-white"></div>
                    <div className="h-0.5 w-5 bg-slate-600 dark:bg-white"></div>
                  </div>
                </button>
              </div>

              {/* User info */}
              <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center border-2 border-slate-200 px-7 py-1 rounded-xl dark:border-white/10">
                <span className="text-[10px] font-bold tracking-widest text-slate-600 dark:text-white/30 text-center">
                  Username: {user.username}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-white/80 text-center truncate max-w-[200px]">
                  Email: {user.email}
                </span>
              </div>

              {/* Profile circle */}
              <div className="h-9 w-9 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 border-2 border-white dark:border-white/10 shadow-md" />
            </header>

            {/* 🔹 Messages */}
            <div
              className="flex-1 space-y-6 overflow-y-auto p-4 md:p-8"
              style={{ paddingBottom: "160px" }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[98%] md:max-w-[95%] rounded-2xl px-4 py-3 text-sm md:text-base ${msg.role === "user"
                        ? "bg-slate-200 dark:bg-[#2f2f30] text-slate-900 dark:text-white shadow-sm rounded-br-none"
                        : "bg-[#f9f9f9] dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white/90 rounded-bl-none"
                      }`}
                  >
                    {/* User message */}
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3">
                              <table className="min-w-full border-collapse text-sm" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-slate-200 dark:bg-white/10" {...props} />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody className="divide-y divide-slate-200 dark:divide-white/10" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="even:bg-slate-100 dark:even:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-white/80 border border-slate-300 dark:border-white/10 whitespace-nowrap" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-4 py-2 text-slate-700 dark:text-white/70 border border-slate-200 dark:border-white/10" {...props} />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {/* 🔹 Status message (web search / email in progress) */}
              {statusMessage && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-medium bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 rounded-bl-none animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    {statusMessage}
                  </div>
                </div>
              )}
              {/* 🔹 Typing indicator (shows while AI is streaming) */}
              {isTyping && !statusMessage && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-5 py-3 bg-[#f9f9f9] dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-bl-none">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/50 animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/50 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-slate-400 dark:bg-white/50 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 🔹 Input */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-linear-to-t from-white dark:from-[#0e0e0e] via-white/80 dark:via-[#0e0e0e]/80 to-transparent">
              <form
                onSubmit={handleSend}
                className="mx-auto max-w-4xl relative"
              >
                {/* Input box */}
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full rounded-2xl border py-3.5 pl-5 pr-14 text-sm md:text-base outline-none transition-all shadow-xl bg-gray-100 dark:bg-[#1a1a1b] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-blue-400"
                />

                {/* Send button */}
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-3 md:px-5 py-1.5 text-xs md:text-sm font-bold transition bg-gray-800 dark:bg-white text-white dark:text-black hover:opacity-90 cursor-pointer active:scale-95"
                >
                  Send <IoIosSend className="text-lg " />
                </button>
              </form>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
