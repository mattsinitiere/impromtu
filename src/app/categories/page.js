import Link from "next/link";
import { CATS, FLAT } from "@/lib/topics";
export const metadata = { title: "Categories — Impromptu" };

export default function Categories() {
  return (
    <section className="wrap sec first">
      <div className="sec-hd">
        <p className="eyebrow">The pool</p>
        <h2>{CATS.length} fields. {FLAT.length.toLocaleString()} topics. Nothing disposable.</h2>
        <p>Every entry is something that will still be worth knowing in a decade. No celebrity news, no internet drama, no trivia questions. Click a field to draw from it now.</p>
      </div>
      <div className="cat-grid">
        {CATS.map((c) => (
          <Link key={c.name} className="cat-tag" href={"/?field=" + encodeURIComponent(c.name)}>{c.name} <span>{c.items.length}</span></Link>
        ))}
      </div>
    </section>
  );
}
