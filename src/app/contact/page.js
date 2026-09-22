import Link from "next/link";
export const metadata = { title: "Contact — Impromptu" };

export default function Contact() {
  return (
    <div className="wrap doc">
      <p className="eyebrow">Contact</p>
      <h1>Bugs, topic suggestions, and everything else.</h1>
      <p className="lede">Impromptu is maintained by one person as a side project. The fastest route for anything technical is the GitHub repository; email works for everything else.</p>
      <p className="stamp">Version 2.0.0 · Typical reply time: a few days</p>

      <h2>Report a bug</h2>
      <p>Open an issue at <a href="https://github.com/mattsinitiere/impromtu/issues" target="_blank" rel="noopener">github.com/mattsinitiere/impromtu/issues</a>. It is the fastest path, and it means the fix is visible to everyone else who hit the same thing.</p>
      <p>A useful report includes:</p>
      <ul>
        <li>Your browser and operating system</li>
        <li>What you were doing — which topic was drawn, which buttons you pressed, whether you were recording</li>
        <li>What you expected, and what happened instead</li>
        <li>Anything red in the browser console, if you know how to open it</li>
      </ul>

      <h2>Suggest a topic</h2>
      <p>The pool is 1,117 topics across 107 fields and it is deliberately incomplete. Suggestions are welcome, especially in fields that feel thin.</p>
      <p>A suggestion is more likely to land if it passes the pool's one test — <strong>will this still be worth understanding in ten years?</strong> — and if it names a real idea rather than a category. "Regression to the mean" works. "Statistics stuff" does not.</p>
      <p>Open an issue, or send a pull request adding it to the <code>RAW</code> array in <code>src/lib/topics.js</code>. The format is documented in the <a href="https://github.com/mattsinitiere/impromtu#the-topic-corpus" target="_blank" rel="noopener">README</a>.</p>

      <h2>Account problems</h2>
      <p>There is no password reset, because there is no email on file. If you are locked out, create a new account. If you need something removed that you cannot remove yourself from <Link href="/settings">Settings</Link>, email with your username.</p>

      <h2>Email</h2>
      <p>For anything that does not belong in a public issue — press, partnerships, or a private question — write to <a href="mailto:matthewsinitiere7@gmail.com">matthewsinitiere7@gmail.com</a>.</p>

      <h2>What to expect</h2>
      <div className="rows">
        <div><b>Bug reports</b><span>Read within a few days. Serious breakage gets fixed first.</span></div>
        <div><b>Topic suggestions</b><span>Batched and reviewed periodically rather than one at a time.</span></div>
        <div><b>Feature requests</b><span>Considered against the <a href="https://github.com/mattsinitiere/impromtu/blob/main/ROADMAP.md" target="_blank" rel="noopener">roadmap</a>. The bar is high.</span></div>
        <div><b>Email</b><span>Answered when time allows. This is not a supported commercial product.</span></div>
      </div>

      <h2>Using it yourself</h2>
      <p>You do not need permission. It is MIT licensed — fork it, change the topic list, rebrand it, run it inside your company. No attribution beyond the licence file is required and no notification is expected.</p>

      <div className="plain">
        <p>Please do not post security reports in a public issue. Email first, and allow a reasonable window for a fix before disclosing.</p>
      </div>
    </div>
  );
}
