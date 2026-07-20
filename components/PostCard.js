function relativeTimeFromNow(isoString) {
  const then = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function PostCard({ post, author }) {
  return (
    <div className="bg-white rounded-xl2 border-l-4 border-brand shadow-sm px-4 py-3">
      {author && (
        <p className="text-xs font-bold text-brand mb-1">@{author}</p>
      )}
      <p className="text-sm text-neutral-800">{post.content}</p>
      {post.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt="Post attachment"
          className="rounded-lg mt-2 max-w-full"
          style={{ maxWidth: 300 }}
        />
      )}
      <p className="text-[11px] text-neutral-400 mt-2">
        {relativeTimeFromNow(post.created_at)}
      </p>
    </div>
  );
}
