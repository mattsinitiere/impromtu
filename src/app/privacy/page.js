import Link from "next/link";
export const metadata = { title: "Privacy — Impromptu", description: "What Impromptu stores, what leaves your device, and how to delete it." };

export default function Privacy() {
  return (
    <div className="wrap doc">
      <p className="eyebrow">Privacy</p>
      <h1>As little as possible, and all of it yours.</h1>
      <p className="lede">Impromptu has an optional account system and no analytics. This page sets out exactly what is stored, where, what leaves your device, and how to delete it.</p>
      <p className="stamp">Effective 22 September 2026 · Version 2.0.0</p>

      <div className="callout">
        <p><strong>The short version.</strong> One email address if you make an account, and only to confirm it and reset the password. No phone number, no tracking cookies, no analytics, no advertising. As a guest, everything stays in your browser. With an account, your notes and graded speeches are stored in a database you can export or delete in one click. When you press Record, that audio goes to OpenAI for transcription and grading — and only then. No payment details are collected.</p>
      </div>

      <h2>Using it as a guest</h2>
      <p>Without an account, Impromptu writes a single entry to your browser's <code>localStorage</code> under the key <code>impromptu:v2</code>. It holds your theme, filters, topic history, saved topics, notes, checklist ticks and cached definitions. It is not transmitted anywhere. Clear site data for this domain to remove it.</p>

      <h2>With an account</h2>
      <h3>What we ask for</h3>
      <p>An email address, a username, a display name and a password. The email is used for exactly three things: the confirmation link when you sign up, password-reset links you request, and logging in. It is not shown to other users, not used for newsletters or marketing, and not shared with anyone except the email delivery service that sends those two kinds of message.</p>
      <h3>What is stored</h3>
      <ul>
        <li>Your login: email address and a hashed password (never the password itself)</li>
        <li>Your profile: username and display name</li>
        <li>A count of graded takes per day, to enforce the daily limit</li>
        <li>Your settings, notes, checklist ticks, topic history and saved topics (so they follow you between devices)</li>
        <li>Every graded speech: topic, transcript, the analysis and grade, word count, duration and date</li>
      </ul>
      <p><strong>Audio is never stored.</strong> The recording exists in your browser's memory only for as long as it takes to transcribe it, and is then discarded.</p>
      <p>Data lives in a Supabase project (Postgres, hosted in the United States) protected by row-level security, so each account can only ever read its own rows. Supabase's handling is governed by the <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase Privacy Policy</a>.</p>
            <h3>Exporting and deleting</h3>
      <p><strong>Download my data</strong> (in <Link href="/settings">Settings</Link> and the footer) gives you everything above as one JSON file. <strong>Delete account</strong> removes your login and every row attached to it immediately and irreversibly. Individual speeches can be deleted from the Speeches page.</p>

      <h2>What leaves your device</h2>
      <h3>Speech recording and grading — only when you press Record</h3>
      <p>The audio of your minute is uploaded to our server, which sends it to OpenAI's Whisper API for transcription and then sends the transcript, topic name and difficulty to OpenAI's chat API for grading, using Impromptu's own OpenAI account. The server keeps nothing but the result. Both requests are subject to the <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener">OpenAI Privacy Policy</a>; by OpenAI's stated API policy, data sent this way is not used to train their models. Nothing is sent if you use the plain timer instead.</p>
      <h3>Definition lookups</h3>
      <p>When a topic is drawn, the app requests a one-sentence summary from the Wikipedia API. That request carries the topic name and, unavoidably, your IP address and user-agent. It carries nothing you have written. See the <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener">Wikimedia Privacy Policy</a>.</p>
      <h3>Fonts</h3>
      <p>Inter and JetBrains Mono load from Google Fonts, which exposes your IP address and user-agent to Google. See the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>.</p>
      <h3>Hosting</h3>
      <p>The site is served by Vercel, which keeps standard access logs (IP address, timestamp, path, user-agent). That is ordinary infrastructure logging, not analytics.</p>

      <h2>What is never collected</h2>
      <ul>
        <li>Phone numbers, real names or payment details</li>
        <li>Audio recordings, beyond the seconds needed to transcribe them</li>
        <li>Behavioural, advertising or analytics profiles of any kind</li>
      </ul>

      <h2>Cookies</h2>
      <p>Signed-in sessions are kept by the auth library in your browser's local storage, not in cookies. No tracking cookies are set.</p>

      <h2>Children</h2>
      <p>Impromptu is not directed at children under 13 and does not knowingly collect information from them. If you are under 13, use it as a guest. If you believe a child has created an account, use the contact page and it will be removed.</p>

      <h2>Your rights</h2>
      <p>Access, portability, correction and erasure under regulations such as the GDPR and CCPA are satisfied by design: <em>Download my data</em> (which includes your email), editing your display name and password, and <em>Delete account</em> are all self-service and immediate. For anything else, use the <Link href="/contact">contact page</Link>.</p>

      <h2>Changes</h2>
      <p>If this policy changes, the effective date above changes with it, and the edit is visible in the project's commit history on <a href="https://github.com/mattsinitiere/impromtu" target="_blank" rel="noopener">GitHub</a>.</p>
    </div>
  );
}
