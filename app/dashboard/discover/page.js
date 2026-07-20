"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/auth";
import PostCard from "@/components/PostCard";

export default function DiscoverPage() {
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const username = getSession();
    if (!username) return;

    supabase
      .from("posts")
      .select("username, content, created_at, image_url")
      .neq("username", username)
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setPosts(data);
        setLoaded(true);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Discover</h1>

      <div className="flex flex-col gap-3">
        {loaded && posts.length === 0 && (
          <p className="text-sm text-neutral-400">
            No posts from other people yet.
          </p>
        )}
        {posts.map((post, i) => (
          <PostCard key={i} post={post} author={post.username} />
        ))}
      </div>
    </div>
  );
}
