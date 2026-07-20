"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { hashPassword } from "@/lib/auth";
import { useToast } from "@/components/useToast";

function isAlnum(str) {
  return /^[a-z0-9]+$/.test(str);
}

function isNameValid(str) {
  return str.length > 0 && /^[A-Za-z\s]+$/.test(str);
}

function toSentenceCase(str) {
  const trimmed = str.trim().replace(/\s+/g, " ");
  if (trimmed.length === 0) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export default function SignupPage() {
  const router = useRouter();
  const { showToast, ToastHost } = useToast();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();

    if (!agreed) {
      showToast("You must agree to the terms.");
      return;
    }

    const cleanName = toSentenceCase(fullName);
    if (cleanName === "") {
      showToast("Full name cannot be empty.");
      return;
    }
    if (!isNameValid(cleanName)) {
      showToast("Full name can only contain letters and spaces.");
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!isAlnum(cleanUsername)) {
      showToast("Username can only contain letters and numbers.");
      return;
    }

    setLoading(true);

    const { data: existing } = await supabase
      .from("users")
      .select("username")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      showToast("Username already exists.");
      setLoading(false);
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      showToast("Please enter a valid email.");
      setLoading(false);
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (password.length < 8) {
      showToast("Password must be at least 8 characters.");
    } else if (password !== confirmPassword) {
      showToast("Passwords do not match.");
    } else if (!hasUpper) {
      showToast("Password must contain an uppercase letter.");
    } else if (!hasLower) {
      showToast("Password must contain a lowercase letter.");
    } else if (!hasSpecial) {
      showToast("Password must contain a special character.");
    } else {
      const hashed = await hashPassword(password);

      const { error } = await supabase.from("users").insert({
        username: cleanUsername,
        full_name: cleanName,
        password: hashed,
        email: cleanEmail,
      });

      if (error) {
        showToast("Something went wrong creating your account.");
      } else {
        showToast("Account created successfully!");
        router.push("/");
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <ToastHost />
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="OnPoint" className="h-[180px] -mb-14" />
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">
          Create your account
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Sign up to get started.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
            required
          />

          <label className="flex items-center gap-2 text-sm text-neutral-600 mt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I agree to the terms
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl2 bg-brand hover:bg-brand-hover text-white font-bold text-sm transition-colors mt-1 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-neutral-500 mt-4">
          Already have an account?{" "}
          <Link href="/" className="text-brand font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
