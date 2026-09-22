"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { downloadJSON } from "@/lib/utils";

export default function Footer() {
  const { user, exportData, toast } = useStore();

  async function download() {
    try {
      const data = await exportData();
      if (data) { downloadJSON(data, "impromptu-data.json"); toast("Your data is downloading."); }
    } catch (e) { toast("Export failed: " + e.message); }
  }

  return (
    <footer className="ftr">
      <div className="wrap ftr-in">
        <span className="brand">Impromptu</span>
        <span className="ver">v2.0.0</span>
        <div className="ftr-links">
          <Link href="/mission">Mission</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/contact">Contact</Link>
          {user && <a href="#" onClick={(e) => { e.preventDefault(); download(); }}>Download my data</a>}
          {user ? <Link href="/settings">Account</Link> : <Link href="/signup">Create account</Link>}
          <a href="https://github.com/mattsinitiere/impromtu" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
