"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getConversation, sendMessage, getAvatarUrl } from "@/lib/messages";
import { useToast } from "@/components/useToast";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast, ToastHost } = useToast();
  const bottomRef = useRef(null);

  const otherUsername = params.username;

  const [username, setUsername] = useState(null);
  const [messages, setMessages] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) {
      loadChat(session);
      getAvatarUrl(otherUsername).then(setAvatarUrl);
    }
  }, [otherUsername]);

  useEffect(() => {
    if (!username) return;
    const interval = setInterval(() => loadChat(username), 3000);
    return () => clearInterval(interval);
  }, [username, otherUsername]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadChat(user) {
    const data = await getConversation(user, otherUsername);
    setMessages(data);
  }

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed === "") {
      showToast("Type something first.");
      return;
    }

    setSending(true);
    const { error } = await sendMessage(username, otherUsername, trimmed);
    setSending(false);

    if (error) {
      showToast("Something went wrong sending that.");
      return;
    }

    setContent("");
    loadChat(username);
  }

  if (!username) return null;

  return (
    <div className="max-w-2xl mx-auto px-8 py-8 flex flex-col h-screen">
      <ToastHost />

      <button
        onClick={() => router.push("/dashboard/messages")}
        className="text-sm text-brand font-bold text-left mb-3"
      >
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={otherUsername}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-neutral-400">🙂</span>
          )}
        </div>
        <p className="font-bold">@{otherUsername}</p>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
        {messages.map((m, i) => {
          const isMe = m.sender === username;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[60%] rounded-xl2 px-3 py-2 text-sm ${
                  isMe
                    ? "bg-brand text-white"
                    : "bg-neutral-200 border border-neutral-300 text-neutral-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={sending}
          className="h-11 px-5 rounded-xl2 bg-brand hover:bg-brand-hover text-white text-sm font-bold disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}