"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession } from "@/lib/auth";
import { useToast } from "@/components/useToast";

export default function ContactPage() {
  const { showToast, ToastHost } = useToast();
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) {
      supabase
        .from("users")
        .select("email, phone")
        .eq("username", session)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setEmail(data.email || "");
            setPhone(data.phone || "");
          }
        });
    }
  }, []);

  async function handleSave(e) {
    e.preventDefault();

    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      showToast("Please enter a valid email.");
      return;
    }
    if (!/^\d{11}$/.test(cleanPhone)) {
      showToast("Phone number must be 11 digits.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ email: cleanEmail, phone: cleanPhone })
      .eq("username", username);

    if (error) {
      showToast("Something went wrong saving your info.");
    } else {
      showToast("Contact info updated!");
    }
  }

  if (!username) return null;

  return (
    <div className="max-w-md mx-auto px-8 py-8">
      <ToastHost />
      <h1 className="text-2xl font-bold text-neutral-900">Contact Info</h1>
      <p className="text-sm text-neutral-500 mb-4">
        Keep this up to date so people can reach you.
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
        />
        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 rounded-xl2 border border-neutral-200 px-4 text-sm focus:outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="h-10 w-28 rounded-xl2 bg-brand hover:bg-brand-hover text-white font-bold text-sm transition-colors"
        >
          Save
        </button>
      </form>
    </div>
  );
}
