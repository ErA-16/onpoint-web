# OnPoint Web

The web companion to the OnPoint desktop app. Same Supabase backend, same accounts — sign up on either one and log in on both.

## What's included

- Login / signup (matching the desktop app's validation rules)
- Home feed — write posts, attach an image, see your own posts
- Discover — everyone else's posts
- Messaging — search a username, chat with them, updates automatically every few seconds
- Profile — avatar, view username/full name, change username, change password
- Contact — edit email/phone
- Collapsible sidebar with logo and branding matching the desktop app

## One important thing to know

The desktop app currently saves your profile photo as a local file path on your PC (e.g. `C:\Users\...\photo.png`) — not uploaded anywhere. That means:

- A photo you set on the **desktop app** won't show up on the **web app** (the path only exists on your computer).
- A photo you set on the **web app** (uploaded to Supabase Storage) will show correctly on both, since the web version stores a real public URL.

If you want photos to match on both, the desktop app's `change_photo` function needs to be updated to upload to Supabase Storage too, the same way `upload_post_image` already does for posts.

## Setup

### 1. Create a new Storage bucket in Supabase

You already have a `post-images` bucket from the desktop app. Create one more:

- Go to **Storage** → **New bucket** → name it `avatars`, make it public.
- Go to **Storage → avatars → Policies** → add a policy allowing `SELECT` and `INSERT` for the `anon` role, same way you set up `post-images` earlier (policy definition: `true`).

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Supabase credentials

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Same URL and key used in the desktop app's `.env` file — just prefixed with `NEXT_PUBLIC_`, since Next.js requires that prefix for values the browser is allowed to read.

### 4. Run it locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this project to a new GitHub repo (separate from the desktop app's repo — different codebases).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**, and select this repo.
3. Vercel auto-detects it's a Next.js app — no build configuration needed.
4. Before deploying, add environment variables in the project settings: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, same values as `.env.local`.
5. Click **Deploy**.

## How login works here

This app doesn't use Supabase's built-in Auth system — same as the desktop app, it checks username/password against the shared `users` table, hashing passwords with SHA-256 to match exactly. That's why an account created on one works immediately on the other.

Since there's no real session/auth token, "being logged in" is tracked with a simple browser `localStorage` flag. Fine for a personal/demo project, not a substitute for real session security at scale.

## How messaging works here

Same shared `messages` table as any future desktop-side chat would use. The chat page polls for new messages every 3 seconds while open — not truly instant like a websocket-based system, but close enough for this project's scope without the added complexity of Supabase Realtime.