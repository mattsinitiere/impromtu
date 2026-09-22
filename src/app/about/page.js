import Link from "next/link";
export const metadata = { title: "About — Impromptu" };

export default function About() {
  return (
    <section className="wrap sec first">
      <div className="sec-hd"><p className="eyebrow">Why</p><h2>Confidence is a byproduct, not a goal.</h2></div>
      <div className="prose">
        <p>Most people don't fear public speaking. They fear being <strong>found out</strong> — asked something they haven't prepared for, in front of people whose opinion matters. The usual advice is to prepare harder, which trains the wrong muscle entirely.</p>
        <p>Impromptu trains the other one. You get a subject you didn't pick, a short window to understand it, and one minute to make it clear to somebody else. Do this a few dozen times and something shifts: unfamiliar material stops reading as a threat and starts reading as a task with a known shape.</p>
        <p>The one-minute limit does most of the work. It's too short to hide behind detail and long enough to expose a fuzzy idea. If you can't say what something is in sixty seconds, you've found the edge of your understanding — which is the most useful thing a session can give you.</p>
        <p>Each topic arrives with a one-sentence definition pulled from Wikipedia. That is the floor, not the research — if you present the sentence you were handed, you have practised reading, not thinking. Use it to check you are chasing the right idea, then close it.</p>
        <p>The grade is there to make the gap visible, not to be optimised. It is honest about filler words because you cannot hear your own, and it tells you three things to fix because a list of ten is a list you ignore. The number that matters is the one on your fifth take, not your first.</p>
        <p>What you write stays in your browser unless you make an account, and then it stays in your account. There is no analytics and nothing is sold. The recording goes to OpenAI on your own key, and only when you press Record. <Link href="/privacy">The details</Link>.</p>
      </div>
      <p className="byline">Built by <b>Matthew Sinitiere</b>.</p>
    </section>
  );
}
