"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, clearSession } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/discover", label: "Discover" },
  { href: "/dashboard/messages", label: "Messages" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/contact", label: "Contact" },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState(null);
  const [checked, setChecked] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace("/");
    } else {
      setUsername(session);
    }
    setChecked(true);
  }, [router]);

  function handleLogout() {
    clearSession();
    router.push("/");
  }

  if (!checked) return null;
  if (!username) return null;

  return (
    <div className="flex min-h-screen">
      <aside
        className={`bg-brand text-white flex flex-col shrink-0 transition-all ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-3 self-start hover:bg-brand-hover rounded-lg mx-2 mt-2"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hamburger.png" alt="Toggle menu" className="h-5 w-5" />
        </button>

        {!collapsed && (
          <>
            <div className="px-5 pt-4 pb-4">
              <p className="text-xs uppercase tracking-wide text-white/70">
                Signed in as
              </p>
              <p className="font-bold">@{username}</p>
            </div>

            <nav className="flex-1 px-2">
              {NAV_ITEMS.map((item) => {
                const active =
                  pathname.startsWith(item.href) &&
                  (item.href !== "/dashboard" || pathname === "/dashboard");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                      active
                        ? "bg-brand-dark font-semibold"
                        : "hover:bg-brand-hover"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleLogout}
              className="mx-2 mb-6 px-3 py-2.5 rounded-lg text-sm text-left hover:bg-brand-hover transition-colors"
            >
              Logout
            </button>
          </>
        )}

        {collapsed && <div className="flex-1" />}
      </aside>

      <main className="flex-1 bg-surface overflow-y-auto">{children}</main>
    </div>
  );
}