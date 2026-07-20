"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { hashPassword, saveSession } from "@/lib/auth";
import { useToast } from "@/components/useToast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast, ToastHost } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const enteredUsername = username.trim().toLowerCase();

    const { data, error } = await supabase
      .from("users")
      .select("password")
      .eq("username", enteredUsername)
      .maybeSingle();

    if (error) {
      showToast("Something went wrong connecting to the server.");
      setLoading(false);
      return;
    }

    if (!data) {
      showToast("Username does not exist.");
      setLoading(false);
      return;
    }

    const hashed = await hashPassword(password);

    if (hashed !== data.password) {
      showToast("Wrong username or password.");
      setLoading(false);
      return;
    }

    saveSession(enteredUsername);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <ToastHost />
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="OnPoint" className="h-[180px] -mb-10" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Log in to OnPoint
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Welcome back. Enter your details below.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl2 bg-brand hover:bg-brand-hover text-white font-bold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
