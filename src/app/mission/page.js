export const metadata = { title: "Mission — Impromptu", description: "Why Impromptu exists: a daily exercise in understanding something unfamiliar and explaining it out loud in one minute." };

export default function Mission() {
  return (
    <div className="wrap doc">
      <p className="eyebrow">Mission</p>
      <h1>Get better at understanding things you did not choose.</h1>
      <p className="lede">Impromptu is a practice tool, not a course. It gives you a subject, a short window, and a hard sixty-second limit — then it tells you honestly how it went.</p>
      <p className="stamp">Version 2.0.0 · Last reviewed 22 September 2026</p>

      <h2>The problem</h2>
      <p>Most people are competent when they have prepared and shaky when they have not. That gap stays invisible until the moment it matters: a question in a meeting, a client asking about something outside the deck, a conversation moving faster than your notes.</p>
      <p>The standard response is to prepare harder. That works right up until you are asked about the one thing you did not prepare for — and it trains the wrong reflex, because it teaches you that unfamiliar material is something to avoid rather than something to process.</p>

      <h2>The exercise</h2>
      <p>Draw a topic you did not pick. Spend ten or fifteen minutes on it. Write the explanation in your own words with the sources closed. Then say it out loud for one minute, standing, without notes — and record it.</p>
      <p>Each constraint is load-bearing:</p>
      <ul>
        <li><strong>You do not choose the topic.</strong> Choosing is how you avoid your blind spots without noticing.</li>
        <li><strong>The research window is short.</strong> The skill is finding the shape of an idea quickly, not achieving mastery.</li>
        <li><strong>You write from memory.</strong> Borrowed phrasing is the reliable signal that you have memorised something rather than understood it.</li>
        <li><strong>One minute, out loud.</strong> Too short to hide behind detail, long enough to expose a fuzzy idea. Speaking is where you discover which sentences you cannot actually finish.</li>
        <li><strong>It gets graded.</strong> You cannot hear your own filler words or notice your own trailing-off. A transcript and a grade can.</li>
      </ul>

      <h2>What gets better</h2>
      <p>Not general intelligence, and not confidence directly. What improves is narrower and more useful: how fast you can orient in an unfamiliar subject, how cleanly you can compress an idea, and how comfortable you are speaking before you feel ready. Confidence follows from those three. It is a byproduct, not a target.</p>

      <h2>What is in the pool</h2>
      <p>1,117 topics across 107 fields, chosen against one test: will this still be worth understanding in ten years? Celebrity news, entertainment cycles, influencer culture and internet arguments fail that test and are excluded on purpose.</p>
      <p>The pool spans the technical and the humane deliberately — the same week that hands you error-correcting codes might hand you the Ship of Theseus. Range is part of the exercise.</p>

      <h2>Principles</h2>
      <div className="rows">
        <div><b>Accounts are optional</b><span>Drawing, writing and the clock work without one. An account exists to keep your graded speeches.</span></div>
        <div><b>Minimal identity</b><span>An email, a username and a password. The email exists to confirm the account and reset the password; it is never shown or sold.</span></div>
        <div><b>Your key, your bill</b><span>Grading runs on your own OpenAI key. We never see it in transit and never mark it up.</span></div>
        <div><b>No ads, no tracking</b><span>There is no analytics script and nothing to sell.</span></div>
        <div><b>Open source</b><span>MIT licensed. Read it, fork it, change the topic list.</span></div>
      </div>

      <h2>What this is not</h2>
      <p>It is not a course, a curriculum, or a substitute for reading properly. It will not make you an expert in anything, and a minute on nuclear fusion does not qualify you to discuss nuclear fusion. The grade is a coach's opinion from a transcript, not a measurement. It is a rep. The value is in doing it often, badly at first, and noticing what falls apart when you speak.</p>

      <div className="callout">
        <p><strong>A reasonable cadence:</strong> one topic a day, five days a week, about twenty minutes each. Record every minute. The gap between what you wrote and what you said is where most of the learning actually is.</p>
      </div>
    </div>
  );
}
