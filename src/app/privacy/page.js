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
        <p><strong>The short version.</strong> No email, no phone number, no cookies for tracking, no analytics, no advertising. As a guest, everything stays in your browser. With an account, your notes and graded speeches are stored in a database you can export or delete in one click. When you press Record, that audio goes to OpenAI on your own API key — and only then.</p>
      </div>

      <h2>Using it as a guest</h2>
      <p>Without an account, Impromptu writes a single entry to your browser's <code>localStorage</code> under the key <code>impromptu:v2</code>. It holds your theme, filters, topic history, saved topics, notes, checklist ticks and cached definitions. It is not transmitted anywhere. Clear site data for this domain to remove it.</p>

      <h2>With an account</h2>
      <h3>What we ask for</h3>
      <p>A username, a display name and a password. Nothing else. There is no email address or phone number, which also means there is no password reset — keep the password somewhere safe.</p>
      <p>Technically, the login system (Supabase Auth) requires an email-shaped identifier, so your username is stored internally as <code>username@impromptu.app</code>. That address does not exist and nothing is ever sent to it.</p>
      <h3>What is stored</h3>
      <ul>
        <li>Your profile: username, display name, and the OpenAI API key you choose to save</li>
        <li>Your settings, notes, checklist ticks, topic history and saved topics (so they follow you between devices)</li>
        <li>Every graded speech: topic, transcript, the analysis and grade, word count, duration and date</li>
      </ul>
      <p><strong>Audio is never stored.</strong> The recording exists in your browser's memory only for as long as it takes to transcribe it, and is then discarded.</p>
      <p>Data lives in a Supabase project (Postgres, hosted in the United States) protected by row-level security, so each account can only ever read its own rows. Supabase's handling is governed by the <a href="https://supabase.com/privacy" target="_blank" rel="noopener">Supabase Privacy Policy</a>.</p>
      <h3>Your API key</h3>
      <p>The OpenAI key is stored in your profile row, encrypted at rest by the database provider, and readable only by your session. It is sent to <code>api.openai.com</code> directly from your browser. It never passes through an Impromptu server, because there isn't one.</p>
      <h3>Exporting and deleting</h3>
      <p><strong>Download my data</strong> (in <Link href="/settings">Settings</Link> and the footer) gives you everything above as one JSON file. <strong>Delete account</strong> removes your login and every row attached to it immediately and irreversibly. Individual speeches can be deleted from the Speeches page.</p>

      <h2>What leaves your device</h2>
      <h3>Speech recording and grading — only when you press Record</h3>
      <p>The audio of your minute is sent to OpenAI's Whisper API for transcription. The transcript, the topic name and the difficulty are then sent to OpenAI's chat API for grading. Both requests are made directly from your browser using your own key and are subject to the <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener">OpenAI Privacy Policy</a>; by OpenAI's stated API policy, data sent this way is not used to train their models. Nothing is sent if you use the plain timer instead.</p>
      <h3>Definition lookups</h3>
      <p>When a topic is drawn, the app requests a one-sentence summary from the Wikipedia API. That request carries the topic name and, unavoidably, your IP address and user-agent. It carries nothing you have written. See the <a href="https://foundation.wikimedia.org/wiki/Policy:Privacy_policy" target="_blank" rel="noopener">Wikimedia Privacy Policy</a>.</p>
      <h3>Fonts</h3>
      <p>Inter and JetBrains Mono load from Google Fonts, which exposes your IP address and user-agent to Google. See the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google Privacy Policy</a>.</p>
      <h3>Hosting</h3>
      <p>The site is served by Vercel, which keeps standard access logs (IP address, timestamp, path, user-agent). That is ordinary infrastructure logging, not analytics.</p>

      <h2>What is never collected</h2>
      <ul>
        <li>Email addresses, phone numbers, real names or payment details</li>
        <li>Audio recordings, beyond the seconds needed to transcribe them</li>
        <li>Behavioural, advertising or analytics profiles of any kind</li>
      </ul>

      <h2>Cookies</h2>
      <p>Signed-in sessions are kept by the auth library in your browser's local storage, not in cookies. No tracking cookies are set.</p>

      <h2>Children</h2>
      <p>Impromptu is not directed at children under 13 and does not knowingly collect information from them. Since no email or age is requested, we rely on you: if you are under 13, use it as a guest.</p>

      <h2>Your rights</h2>
      <p>Access, portability, correction and erasure under regulations such as the GDPR and CCPA are satisfied by design: <em>Download my data</em>, editing your display name, and <em>Delete account</em> are all self-service and immediate. For anything else, use the <Link href="/contact">contact page</Link>.</p>

      <h2>Changes</h2>
      <p>If this policy changes, the effective date above changes with it, and the edit is visible in the project's commit history on <a href="https://github.com/mattsinitiere/impromtu" target="_blank" rel="noopener">GitHub</a>.</p>
    </div>
  );
}
