import { supabase } from "@/lib/supabaseClient";

export async function getConversationsList(username) {
  const { data, error } = await supabase
    .from("messages")
    .select("sender, receiver, content, created_at")
    .or(`sender.eq.${username},receiver.eq.${username}`)
    .order("id", { ascending: false });

  if (error || !data) return [];

  const seen = new Map();

  for (const row of data) {
    const otherPerson = row.sender === username ? row.receiver : row.sender;
    if (!seen.has(otherPerson)) {
      seen.set(otherPerson, { content: row.content, created_at: row.created_at });
    }
  }

  return Array.from(seen.entries()).map(([otherUsername, last]) => ({
    otherUsername,
    lastMessage: last.content,
    createdAt: last.created_at,
  }));
}

export async function getConversation(userA, userB) {
  const { data, error } = await supabase
    .from("messages")
    .select("sender, content, created_at")
    .or(
      `and(sender.eq.${userA},receiver.eq.${userB}),and(sender.eq.${userB},receiver.eq.${userA})`
    )
    .order("id", { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function sendMessage(sender, receiver, content) {
  return supabase.from("messages").insert({ sender, receiver, content });
}

export async function getAvatarUrl(username) {
  const { data } = await supabase
    .from("users")
    .select("photo_path")
    .eq("username", username)
    .maybeSingle();

  if (data && data.photo_path && data.photo_path.startsWith("http")) {
    return data.photo_path;
  }
  return null;
}