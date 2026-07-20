# OnPoint Web

The web companion to the OnPoint desktop app. Same Supabase backend, same accounts — sign up on either one and log in on both.

## What's included in this first pass

- Login / signup (matching the desktop app's validation rules)
- Home feed — write posts, attach an image, see your own posts
- Discover — everyone else's posts
- Profile — avatar, view username/full name, change username, change password
- Contact — edit email/phone

**Not included yet:** messaging. That needs a bit more thought about real-time updates on the web and is a good next step once this is deployed and working.

## One important thing to know before you deploy

The desktop app currently saves your profile photo as a **local file path on your PC** (e.g. `C:\Users\...\photo.png`) — not uploaded anywhere. That means:

- A photo you set on the **desktop app** won't show up on the **web app** (the path only exists on your computer).
- A photo you set on the **web app** (uploaded to Supabase Storage) *will* show correctly on both, since the web version stores a real public URL.

If you want photos to match on both, the desktop app's `change_photo` function needs to be updated to upload to Supabase Storage too, the same way `upload_post_image` already does for posts. Happy to help with that whenever you're ready — it's a small change using the same pattern.

## Setup

### 1. Create a new Storage bucket in Supabase

You already have a `post-images` bucket from the desktop app. Create one more:

- Go to **Storage** → **New bucket** → name it `avatars`, make it **public**.
- Go to **Storage → avatars → Policies** → add a policy allowing `SELECT` and `INSERT` for the `anon` role, same way you set up `post-images` earlier (policy definition: `true`).

### 2. Install dependencies

```bash
npm install
```

### 3. Add your Supabase credentials

Copy the example env file and fill in your real values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Same URL and key you used in your desktop app's `.env` file — just prefixed with `NEXT_PUBLIC_` since Next.js requires that prefix for values the browser is allowed to read.

### 4. Run it locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this project to a **new** GitHub repo (separate from your desktop app's repo — different codebases).
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**, and select this repo.
3. Vercel auto-detects it's a Next.js app — no build configuration needed.
4. Before deploying, add your environment variables: in the project settings, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with the same values from your `.env.local`.
5. Click **Deploy**. Vercel gives you a live URL once it finishes.

## Notes on how login works here

This app doesn't use Supabase's built-in Auth system — same as your desktop app, it checks a username/password against your own `users` table, hashing passwords with SHA-256 to match exactly what the desktop app does. That's why an account created on one works immediately on the other.

Since there's no real session/auth token, "being logged in" is tracked with a simple browser `localStorage` flag. This is fine for a personal/demo project, but isn't a substitute for real session security if this ever needs to handle sensitive data at scale.
