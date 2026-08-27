"use client";
// Day 13 - Direct Messaging
// Inspiration: https://dribbble.com/shots/19827341-Messaging-App-UI
// Full-featured chat UI with animated bubbles, typing indicator, reactions, and emoji picker

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

type Message = {
  id: number;
  from: "me" | "them";
  text: string;
  time: string;
  reaction?: string;
  read?: boolean;
};

const conversations = [
  {
    id: 1,
    name: "Alex Rivera",
    avatar: "AR",
    color: ["#667eea", "#764ba2"],
    lastMsg: "Sounds great! See you then 🎉",
    time: "2m",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Yuki Tanaka",
    avatar: "YT",
    color: ["#f953c6", "#b91d73"],
    lastMsg: "Can you send the design files?",
    time: "14m",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Marcus Chen",
    avatar: "MC",
    color: ["#43e97b", "#38f9d7"],
    lastMsg: "Just pushed the updates 🚀",
    time: "1h",
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: "Sophie Lane",
    avatar: "SL",
    color: ["#f7971e", "#ffd200"],
    lastMsg: "Thanks for the feedback!",
    time: "3h",
    unread: 0,
    online: false,
  },
];

const initialMessages: Message[] = [
  { id: 1, from: "them", text: "Hey! Are you free this evening?", time: "3:42 PM", read: true },
  { id: 2, from: "me", text: "Yeah, what's up?", time: "3:43 PM", read: true },
  { id: 3, from: "them", text: "Was thinking we could finalize the designs for the new dashboard 👀", time: "3:43 PM", read: true },
  { id: 4, from: "me", text: "Perfect timing! I just finished the first draft", time: "3:45 PM", read: true },
  { id: 5, from: "them", text: "Amazing 🔥 Can we hop on a call around 7?", time: "3:46 PM", read: true, reaction: "❤️" },
  { id: 6, from: "me", text: "Sounds great! See you then 🎉", time: "3:47 PM", read: true },
];

const emojis = ["❤️", "😂", "😮", "😢", "👍", "🔥"];

export default function Day13() {
  const [activeConvo, setActiveConvo] = useState(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [reactionTarget, setReactionTarget] = useState<number | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    if (!draft.trim()) return;
    const msg: Message = {
      id: Date.now(),
      from: "me",
      text: draft.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };
    setMessages((m) => [...m, msg]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const responses = [
        "That's awesome!",
        "Love it 😊",
        "Makes sense!",
        "Can't wait to see the final version",
      ];
      const reply: Message = {
        id: Date.now() + 1,
        from: "them",
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      };
      setMessages((m) => [...m, reply]);
    }, 1800);
  };

  const addReaction = (msgId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, reaction: emoji } : m)),
    );
    setReactionTarget(null);
  };

  return (
    <div
      className="h-full w-full flex items-center justify-center p-0 sm:p-4"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fdf2ff 100%)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl h-full sm:h-[600px] bg-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex"
      >
        {/* Sidebar */}
        <div
          className={`${
            mobileChatOpen ? "hidden" : "flex"
          } md:flex w-full md:w-72 flex-shrink-0 flex-col border-r`}
          style={{ borderColor: "#f3f4f6" }}
        >
          {/* Search */}
          <div className="p-4 border-b" style={{ borderColor: "#f3f4f6" }}>
            <h2 className="text-gray-800 font-bold text-base m-0 mb-3">Messages</h2>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "#f3f4f6" }}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-gray-600 flex-1 min-w-0"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <motion.button
                key={c.id}
                onClick={() => {
                  setActiveConvo(c);
                  setMobileChatOpen(true);
                }}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="flex items-center gap-3 w-full px-4 py-3 border-none cursor-pointer text-left"
                style={{
                  background:
                    activeConvo.id === c.id ? "#f0f4ff" : "transparent",
                }}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})`,
                    }}
                  >
                    {c.avatar}
                  </div>
                  {c.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-800 truncate">{c.name}</span>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{c.time}</span>
                  </div>
                  <p className="m-0 text-xs text-gray-500 truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${c.color[0]}, ${c.color[1]})` }}
                  >
                    {c.unread}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div
          className={`${
            mobileChatOpen ? "flex" : "hidden"
          } md:flex flex-1 flex-col min-w-0`}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b"
            style={{ borderColor: "#f3f4f6" }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileChatOpen(false)}
              className="md:hidden w-9 h-9 -ml-1 flex-shrink-0 rounded-full flex items-center justify-center border-none cursor-pointer"
              style={{ background: "#f3f4f6" }}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${activeConvo.color[0]}, ${activeConvo.color[1]})`,
                }}
              >
                {activeConvo.avatar}
              </div>
              {activeConvo.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-gray-800 truncate">{activeConvo.name}</p>
              <p className="m-0 text-xs text-gray-500">
                {activeConvo.online ? "Active now" : "Offline"}
              </p>
            </div>
            <div className="ml-auto flex gap-2 flex-shrink-0">
              {[
                <path key="phone" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                <path key="video" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.882v6.236a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
              ].map((d, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden sm:flex w-9 h-9 rounded-full border-none cursor-pointer items-center justify-center"
                  style={{ background: "#f3f4f6" }}
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {d}
                  </svg>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col gap-2">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i < 6 ? i * 0.04 : 0 }}
                className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"} group`}
              >
                <div className="relative max-w-[85%] sm:max-w-[70%]">
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.from === "me"
                        ? {
                            background: `linear-gradient(135deg, ${activeConvo.color[0]}, ${activeConvo.color[1]})`,
                            color: "#fff",
                            borderBottomRightRadius: 6,
                          }
                        : {
                            background: "#f3f4f6",
                            color: "#1f2937",
                            borderBottomLeftRadius: 6,
                          }
                    }
                  >
                    {msg.text}
                  </div>

                  {/* Reaction */}
                  {msg.reaction && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute -bottom-2 ${msg.from === "me" ? "left-1" : "right-1"} text-sm bg-white rounded-full px-1.5 shadow-sm border`}
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      {msg.reaction}
                    </motion.span>
                  )}

                  {/* Reaction picker trigger */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className={`absolute opacity-0 group-hover:opacity-100 -top-2 ${msg.from === "me" ? "left-0" : "right-0"} bg-white border rounded-full px-1.5 py-0.5 text-xs shadow cursor-pointer border-none`}
                    style={{ borderColor: "#e5e7eb" }}
                    onClick={() =>
                      setReactionTarget(reactionTarget === msg.id ? null : msg.id)
                    }
                  >
                    +😊
                  </motion.button>

                  {/* Emoji picker */}
                  <AnimatePresence>
                    {reactionTarget === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 5 }}
                        className={`absolute -top-12 ${msg.from === "me" ? "right-0" : "left-0"} flex gap-1 bg-white rounded-full shadow-lg px-2 py-1.5 border z-10`}
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        {emojis.map((e) => (
                          <motion.button
                            key={e}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.8 }}
                            onClick={() => addReaction(msg.id, e)}
                            className="text-lg border-none bg-transparent cursor-pointer"
                          >
                            {e}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p
                    className={`m-0 text-[10px] text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}
                  >
                    {msg.time}{msg.from === "me" && msg.read && " · Read"}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            <AnimatePresence>
              {typing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex justify-start"
                >
                  <div
                    className="flex gap-1.5 items-center px-4 py-3 rounded-2xl"
                    style={{ background: "#f3f4f6", borderBottomLeftRadius: 6 }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-t"
            style={{ borderColor: "#f3f4f6" }}
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowEmoji((s) => !s)}
              className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-lg"
              style={{ background: "#f3f4f6" }}
            >
              😊
            </motion.button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Message..."
              className="flex-1 px-4 py-2.5 rounded-2xl text-sm border-none outline-none bg-gray-100 text-gray-800 placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={send}
              disabled={!draft.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer text-white"
              style={{
                background: draft.trim()
                  ? `linear-gradient(135deg, ${activeConvo.color[0]}, ${activeConvo.color[1]})`
                  : "#e5e7eb",
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
