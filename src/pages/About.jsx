import { Link } from 'react-router-dom'
import '../About.css'

function About() {
  return (
    <div className="about-container">
      <Link to="/" className="back-link" title="Return to the home page">
        Back to Reader
      </Link>

      <h1 className="about-title">About Lectio</h1>

      <section className="about-section">
        <h2>What is RSVP?</h2>
        <p>
          Lectio uses <strong>RSVP</strong> (Rapid Serial Visual Presentation),
          a method of displaying text one word at a time in a fixed position. Instead of
          moving your eyes across lines, words appear sequentially in the same spot.
        </p>
        <p>
          This technique was developed in the 1970s by researchers studying reading and
          has since been adapted into speed reading applications. The premise is simple:
          eliminate eye movement and you can process words faster.
        </p>
      </section>

      <section className="about-section">
        <h2>The Optimal Recognition Point</h2>
        <p>
          When you read a word, your eyes naturally land slightly left of center, at what
          researchers call the <strong>Optimal Recognition Point (ORP)</strong>. This is
          where the brain most efficiently recognizes words.
        </p>
        <p>
          Lectio calculates the ORP for each word and aligns it to a fixed focal point,
          highlighted in red. Your eyes stay in one place while words stream past.
        </p>
        <div className="orp-demo">
          <div className="demo-word">
            <span className="demo-before">rec</span>
            <span className="demo-orp">o</span>
            <span className="demo-after">gnition</span>
          </div>
          <p className="demo-caption">The ORP is positioned at the red letter</p>
        </div>
      </section>

      <section className="about-section">
        <h2>The Trade-off</h2>
        <p>
          Here's what the research actually shows: <strong>RSVP increases speed at the
          cost of comprehension</strong>. This isn't a minor caveat—it's the fundamental
          trade-off you're making.
        </p>
        <p>
          Normal reading involves backward eye movements called <strong>regressions</strong>.
          These aren't inefficiencies to be eliminated—they're how you repair comprehension
          failures, re-read confusing passages, and integrate meaning across sentences.
          RSVP makes regressions impossible. Miss something and it's gone.
        </p>
        <p>
          Research also shows that <strong>subvocalization</strong> (silently sounding out
          words) aids comprehension, particularly for connecting ideas across sentences.
          Speed reading techniques often encourage suppressing this natural process.
        </p>
      </section>

      <section className="about-section">
        <h2>The Comprehension Curve</h2>
        <p>
          Everyone has an optimal reading speed—the pace at which they absorb the most
          information per unit of time. Read too slowly and you waste time. Read too fast
          and comprehension drops faster than speed increases, so you actually absorb less.
        </p>
        <p>
          Speed reading assumes most people read below their optimum and could comprehend
          more by reading faster. But this assumption isn't always true. Your optimal speed
          varies by text difficulty, familiarity with the subject, and your goals. For
          challenging material, your natural pace may already be optimal—or even too fast.
        </p>
        <div className="speed-guide">
          <div className="speed-tier">
            <span className="speed-range">150-250</span>
            <span className="speed-label">Comfortable</span>
          </div>
          <div className="speed-tier">
            <span className="speed-range">300-450</span>
            <span className="speed-label">Brisk</span>
          </div>
          <div className="speed-tier">
            <span className="speed-range">500-700</span>
            <span className="speed-label">Fast</span>
          </div>
          <div className="speed-tier">
            <span className="speed-range">800+</span>
            <span className="speed-label">Sprint</span>
          </div>
        </div>
        <p className="speed-note">
          Higher speeds will reduce comprehension. That might be acceptable depending
          on your goals, but don't expect to read at 600 WPM with full understanding.
        </p>
      </section>

      <section className="about-section">
        <h2>When RSVP Makes Sense</h2>
        <ul>
          <li>Skimming content to decide if it's worth reading carefully</li>
          <li>Light material where missing details doesn't matter</li>
          <li>Re-reading something you've already absorbed once</li>
          <li>When you genuinely need speed more than depth</li>
        </ul>
        <p>
          RSVP is a tool with specific uses, not a superior way to read. For material
          that matters—anything you need to understand, remember, or think critically
          about—traditional reading is more effective.
        </p>
      </section>

      <section className="about-section last">
        <h2>Further Reading</h2>
        <ul className="references-list">
          <li>
            <a href="https://doi.org/10.1177/1529100615623267" target="_blank" rel="noopener noreferrer">
              So Much to Read, So Little Time: How Do We Read, and Can Speed Reading Help?
            </a>
            <p>
              Rayner et al. (2016) review the science of reading and find that speed-accuracy
              trade-offs are unavoidable. RSVP prevents the regressions needed to correct
              misunderstandings. The way to read faster is to become a more skilled reader
              through practice and vocabulary building—not technological shortcuts.
            </p>
          </li>
          <li>
            <a href="https://doi.org/10.1016/S0022-5371(80)90628-3" target="_blank" rel="noopener noreferrer">
              Subvocalization and Reading for Meaning
            </a>
            <p>
              Slowiaczek &amp; Clifton (1980) demonstrate that subvocalization aids comprehension,
              especially for integrating concepts across sentences. Suppressing inner speech—a
              common speed reading recommendation—impairs understanding.
            </p>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/bxkEshxKnRde97bmW/the-comprehension-curve" target="_blank" rel="noopener noreferrer">
              The Comprehension Curve
            </a>
            <p>
              This essay introduces the idea that each reader has an optimal speed for maximizing
              total comprehension. Speed reading only helps if you're currently reading below
              that optimum—which isn't a safe assumption.
            </p>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default About
