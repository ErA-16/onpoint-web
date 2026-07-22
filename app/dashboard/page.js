"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/auth";
import { useToast } from "@/components/useToast";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const { showToast, ToastHost } = useToast();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [username, setUsername] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [posting, setPosting] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) {
      loadPosts(session);
      supabase
        .from("users")
        .select("full_name")
        .eq("username", session)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.full_name) {
            setFirstName(data.full_name.split(" ")[0]);
          }
        });
    }
  }, []);

  async function loadPosts(user) {
    const { data, error } = await supabase
      .from("posts")
      .select("content, created_at, image_url")
      .eq("username", user)
      .order("id", { ascending: false });

    if (!error) setPosts(data);
  }

  async function handleContentChange(e) {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      const term = match[1].toLowerCase();
      const { data } = await supabase
        .from("users")
        .select("username")
        .ilike("username", `${term}%`)
        .limit(5);
      setMentionSuggestions(data || []);
    } else {
      setMentionSuggestions([]);
    }
  }

  function selectMention(selectedUsername) {
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = content.slice(0, cursorPos);
    const textAfterCursor = content.slice(cursorPos);

    const replaced = textBeforeCursor.replace(/@(\w*)$/, `@${selectedUsername} `);

    setContent(replaced + textAfterCursor);
    setMentionSuggestions([]);
    textareaRef.current.focus();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handlePost() {
    const trimmed = content.trim();
    if (trimmed === "") {
      showToast("Write something before posting.");
      return;
    }

    setPosting(true);

    let imageUrl = null;

    if (imageFile) {
      const fileName = `${username}_${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        showToast("Something went wrong uploading the image.");
        setPosting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(fileName);
      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from("posts").insert({
      username,
      content: trimmed,
      image_url: imageUrl,
    });

    if (error) {
      showToast("Something went wrong posting.");
    } else {
      setContent("");
      removeImage();
      loadPosts(username);
    }

    setPosting(false);
  }

  if (!username) return null;

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <ToastHost />
      <h1 className="text-2xl font-bold text-neutral-900">
        Welcome, {firstName}!
      </h1>
      <p className="text-sm text-neutral-500 mb-4">
        What&apos;s on your mind today?
      </p>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Write something..."
          rows={3}
          className="w-full rounded-xl2 border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-brand bg-neutral-50 focus:bg-white transition-colors"
        />

        {mentionSuggestions.length > 0 && (
          <div className="absolute left-0 right-0 bg-white border border-neutral-200 rounded-xl2 shadow-lg z-10 overflow-hidden">
            {mentionSuggestions.map((s) => (
              <button
                key={s.username}
                onClick={() => selectMention(s.username)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-50"
              >
                @{s.username}
              </button>
            ))}
          </div>
        )}
      </div>

      {imagePreview && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Selected preview"
            className="rounded-lg border border-neutral-200 max-w-full"
            style={{ maxWidth: 340 }}
          />
          <button
            onClick={removeImage}
            className="text-xs text-brand font-semibold mt-1"
          >
            Remove image
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <label className="cursor-pointer bg-neutral-100 hover:bg-neutral-200 transition-colors rounded-lg px-3 py-2 inline-flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/camera_icon.png" alt="Attach image" className="h-4 w-4" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handlePost}
          disabled={posting}
          className="bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl2 px-5 py-2 transition-colors disabled:opacity-60"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      <div className="flex flex-col gap-3 mt-8">
        {posts.length === 0 && (
          <p className="text-sm text-neutral-400">
            Nothing here yet — write your first post above.
          </p>
        )}
        {posts.map((post, i) => (
          <PostCard key={i} post={post} />
        ))}
      </div>
    </div>
  );
}