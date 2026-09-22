import Link from "next/link";
export const metadata = { title: "How it works — Impromptu" };

export default function How() {
  return (
    <section className="wrap sec first">
      <div className="sec-hd">
        <p className="eyebrow">The loop</p>
        <h2>Four steps, about twenty minutes.</h2>
        <p>The difficulty is the point. You can't rehearse for a topic you haven't seen, which is exactly the situation you're training for.</p>
      </div>
      <div className="steps">
        <div className="step"><div className="step-n">STEP 01</div><h3>Research</h3>
          <p>Ten to fifteen minutes, no more. Read enough to find the shape of the idea: what it is, why it exists, where it breaks. Deliberately stop before you feel ready.</p></div>
        <div className="step"><div className="step-n">STEP 02</div><h3>Write</h3>
          <p>Put it in your own words, without the sources open. Borrowed phrasing is the tell that you've memorised rather than understood — rewrite anything you can't explain twice.</p></div>
        <div className="step"><div className="step-n">STEP 03</div><h3>Present</h3>
          <p>One minute, out loud, standing, notes away. Press <em>Record the minute</em> and the clock and the microphone start together. Stop early if you finish; it stops itself at sixty.</p></div>
        <div className="step"><div className="step-n">STEP 04</div><h3>Read the grade</h3>
          <p>The recording is transcribed and graded A+ to F on clarity, structure, accuracy and delivery, with every filler word counted and three specific things to fix. Then record another take.</p></div>
      </div>
      <div className="sec-hd" style={{ marginTop: 56 }}>
        <p className="eyebrow">What you need</p>
        <h2>An account and an OpenAI key.</h2>
        <p>Drawing topics, the notes and the clock work for anyone. Recording and grading need a free account (a username and a password, nothing else) and your own OpenAI API key, which you are asked for the first time you press Record. Grading a minute costs about a cent, billed to you by OpenAI. <Link href="/privacy">What gets sent where</Link>.</p>
      </div>
      <div className="row-actions"><Link className="btn btn--primary" href="/">Draw a topic</Link><Link className="btn" href="/signup">Create account</Link></div>
    </section>
  );
}
