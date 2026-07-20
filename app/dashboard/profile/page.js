"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getSession, saveSession, hashPassword } from "@/lib/auth";
import { useToast } from "@/components/useToast";

export default function ProfilePage() {
  const { showToast, ToastHost } = useToast();
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(null);
  const [fullName, setFullName] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);

  const [newUsername, setNewUsername] = useState("");
  const [showUsernameForm, setShowUsernameForm] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    const session = getSession();
    setUsername(session);
    if (session) loadProfile(session);
  }, []);

  async function loadProfile(user) {
    const { data } = await supabase
      .from("users")
      .select("full_name, photo_path")
      .eq("username", user)
      .maybeSingle();

    if (data) {
      setFullName(data.full_name);
      setPhotoUrl(
        data.photo_path && data.photo_path.startsWith("http")
          ? data.photo_path
          : null
      );
    }
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${username}_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) {
      showToast("Something went wrong uploading the photo.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    await supabase
      .from("users")
      .update({ photo_path: publicUrlData.publicUrl })
      .eq("username", username);

    setPhotoUrl(publicUrlData.publicUrl);
    showToast("Profile photo updated!");
  }

  async function handleUsernameChange(e) {
    e.preventDefault();
    const cleaned = newUsername.trim().toLowerCase();

    if (!/^[a-z0-9]+$/.test(cleaned)) {
      showToast("Username can only contain letters and numbers.");
      return;
    }

    const { data: existing } = await supabase
      .from("users")
      .select("username")
      .eq("username", cleaned)
      .maybeSingle();

    if (existing) {
      showToast("That username is already taken.");
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ username: cleaned })
      .eq("username", username);

    if (error) {
      showToast("Something went wrong updating your username.");
      return;
    }

    saveSession(cleaned);
    setUsername(cleaned);
    setNewUsername("");
    setShowUsernameForm(false);
    showToast("Username updated successfully!");
  }

  async function handlePasswordChange(e) {
    e.preventDefault();

    const { data } = await supabase
      .from("users")
      .select("password")
      .eq("username", username)
      .maybeSingle();

    const currentHashed = await hashPassword(currentPw);

    if (!data || currentHashed !== data.password) {
      showToast("Current password is incorrect.");
      return;
    }

    const hasUpper = /[A-Z]/.test(newPw);
    const hasLower = /[a-z]/.test(newPw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(newPw);

    if (newPw.length < 8) {
      showToast("New password must be at least 8 characters.");
    } else if (newPw !== confirmPw) {
      showToast("New passwords do not match.");
    } else if (!hasUpper) {
      showToast("New password must contain an uppercase letter.");
    } else if (!hasLower) {
      showToast("New password must contain a lowercase letter.");
    } else if (!hasSpecial) {
      showToast("New password must contain a special character.");
    } else {
      const newHashed = await hashPassword(newPw);
      await supabase
        .from("users")
        .update({ password: newHashed })
        .eq("username", username);

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowPasswordForm(false);
      showToast("Password updated successfully!");
    }
  }

  if (!username) return null;

  return (
    <div className="max-w-md mx-auto px-8 py-8">
      <ToastHost />

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-neutral-200 flex items-center justify-center border border-neutral-200">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl text-neutral-400">🙂</span>
          )}
        </div>
        <h1 className="text-lg font-bold mt-3">{fullName}</h1>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs mt-2 border border-neutral-300 rounded-lg px-3 py-1.5 hover:bg-neutral-100"
        >
          Change photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      <div className="bg-white rounded-xl2 p-4">
        <p className="text-[11px] text-neutral-400 uppercase">Username</p>
        <p className="text-sm font-bold mb-2">{username}</p>

        {!showUsernameForm ? (
          <button
            onClick={() => setShowUsernameForm(true)}
            className="text-xs text-brand font-semibold"
          >
            Change Username
          </button>
        ) : (
          <form onSubmit={handleUsernameChange} className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="flex-1 h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="text-xs bg-brand text-white rounded-lg px-3 font-semibold"
            >
              Save
            </button>
          </form>
        )}

        <p className="text-[11px] text-neutral-400 uppercase mt-4">
          Full Name
        </p>
        <p className="text-sm font-bold">{fullName}</p>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="text-xs text-brand font-semibold mt-4"
          >
            Change Password
          </button>
        ) : (
          <form
            onSubmit={handlePasswordChange}
            className="flex flex-col gap-2 mt-3"
          >
            <input
              type="password"
              placeholder="Current password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:outline-none focus:border-brand"
            />
            <input
              type="password"
              placeholder="New password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className="h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:outline-none focus:border-brand"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="h-9 rounded-lg border border-neutral-200 px-3 text-sm focus:outline-none focus:border-brand"
            />
            <button
              type="submit"
              className="text-xs bg-brand text-white rounded-lg px-3 py-2 font-semibold self-start"
            >
              Save password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
