"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/auth";
import { getConversationsList, getAvatarUrl } from "@/lib/messages";
import { useToast } from "@/components/useToast";

function relativeTime(isoString) {
  const then = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function MessagesInboxPage() {
  const router = useRouter();
  const { showToast, ToastHost } = useToast();

  const [username, setUsername] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [avatars, setAvatars] = useState({});
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) loadInbox(session);
  }, []);

  async function loadInbox(user) {
    const list = await getConversationsList(user);
    setConversations(list);

    const avatarEntries = await Promise.all(
      list.map(async (c) => [c.otherUsername, await getAvatarUrl(c.otherUsername)])
    );
    setAvatars(Object.fromEntries(avatarEntries));
  }

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const term = searchValue.trim().toLowerCase();

    if (term === "") {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("users")
        .select("username")
        .ilike("username", `${term}%`)
        .neq("username", username)
        .limit(6);

      setSuggestions(data || []);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchValue, username]);

  function selectUser(target) {
    setSearchValue("");
    setSuggestions([]);
    router.push(`/dashboard/messages/${target}`);
  }

  if (!username) return null;

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <ToastHost />
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Messages</h1>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search username..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
        />

        {suggestions.length > 0 && (
          <div className="absolute top-12 left-0 right-0 bg-white border border-neutral-200 rounded-xl2 shadow-lg z-10 overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.username}
                onClick={() => selectUser(s.username)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-neutral-50"
              >
                @{s.username}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {conversations.length === 0 && (
          <p className="text-sm text-neutral-400">
            No conversations yet — search a username above to start one.
          </p>
        )}

        {conversations.map((c) => (
          <button
            key={c.otherUsername}
            onClick={() => router.push(`/dashboard/messages/${c.otherUsername}`)}
            className="flex items-center gap-3 bg-white hover:bg-neutral-50 rounded-xl2 px-4 py-3 text-left transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center shrink-0">
              {avatars[c.otherUsername] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatars[c.otherUsername]}
                  alt={c.otherUsername}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-neutral-400 text-lg">🙂</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">@{c.otherUsername}</p>
              <p className="text-xs text-neutral-500 truncate">
                {c.lastMessage}
              </p>
            </div>
            <p className="text-[11px] text-neutral-400 shrink-0">
              {relativeTime(c.createdAt)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}