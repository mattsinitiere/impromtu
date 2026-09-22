"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

const NAV = [
  ["/", "Home"],
  ["/categories", "Categories"],
  ["/how", "How it works"],
  ["/speeches", "Speeches"],
  ["/about", "About"],
];

export default function Header() {
  const { S, setTheme, user, profile, hasAccounts } = useStore();
  const path = usePathname();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const f = () => setStuck(window.scrollY > 8);
    f(); addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);

  const dark = S.theme === "dark";
  const initial = (profile?.display_name || profile?.username || "?").charAt(0).toUpperCase();

  return (
    <header className={"hdr" + (stuck ? " stuck" : "")}>
      <div className="wrap hdr-in">
        <Link className="brand" href="/">Impromptu</Link>
        <nav className="nav" aria-label="Sections">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className={path === href ? "on" : ""}>{label}</Link>
          ))}
        </nav>
        <div className="hdr-act">
          {hasAccounts && (user ? (
            <Link className="user-chip" href="/settings" title="Settings">
              <span className="avatar">{initial}</span>
              <span>{profile?.display_name || "Account"}</span>
            </Link>
          ) : (
            <>
              <Link className="btn btn--ghost btn--sm" href="/login">Log in</Link>
              <Link className="btn btn--primary btn--sm" href="/signup">Sign up</Link>
            </>
          ))}
          <Link className="icon-btn" href="/settings" aria-label="Settings" title="Settings">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
          </Link>
          <button className="icon-btn" onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title="Theme (T)">
            <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
            <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
}
