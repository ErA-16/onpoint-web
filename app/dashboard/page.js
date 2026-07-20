"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/auth";
import { useToast } from "@/components/useToast";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const { showToast, ToastHost } = useToast();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posts, setPosts] = useState([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) loadPosts(session);
  }, []);

  async function loadPosts(user) {
    const { data, error } = await supabase
      .from("posts")
      .select("content, created_at, image_url")
      .eq("username", user)
      .order("id", { ascending: false });

    if (!error) setPosts(data);
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
      <h1 className="text-2xl font-bold text-neutral-900">Welcome!</h1>
      <p className="text-sm text-neutral-500 mb-4">
        What&apos;s on your mind today?
      </p>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
        rows={3}
        className="w-full rounded-xl2 border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-brand bg-neutral-50 focus:bg-white transition-colors"
      />

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
