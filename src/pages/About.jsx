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
        <h2>Rapid Serial Visual Presentation</h2>
        <p>
          Lectio uses a technique called <strong>RSVP</strong> (Rapid Serial Visual Presentation),
          a method of displaying text one word at a time in a fixed position. Unlike traditional
          reading where your eyes must move across lines and jump between words, RSVP eliminates
          eye movement entirely—the words come to you.
        </p>
        <p>
          This approach was first developed in the 1970s by researchers studying reading
          comprehension and has since been refined for speed reading applications. By removing
          the physical act of scanning text, readers can focus purely on processing meaning.
        </p>
      </section>

      <section className="about-section">
        <h2>The Optimal Recognition Point</h2>
        <p>
          When you read a word, your eyes don't focus on the center—they naturally land slightly
          left of middle, at what researchers call the <strong>Optimal Recognition Point (ORP)</strong>.
          This is the position where the brain can most efficiently recognize the entire word.
        </p>
        <p>
          Lectio calculates the ORP for each word and aligns it to a fixed focal point on screen,
          highlighted in red. This means your eyes never need to adjust—every word is perfectly
          positioned for instant recognition.
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
        <h2>Why It Works</h2>
        <p>
          Traditional reading involves three time-consuming processes:
        </p>
        <ul>
          <li><strong>Saccades</strong> — rapid eye movements between words</li>
          <li><strong>Fixations</strong> — brief pauses where the eye focuses on a word</li>
          <li><strong>Regressions</strong> — backward movements to re-read missed content</li>
        </ul>
        <p>
          Studies suggest these mechanical processes consume up to 80% of reading time. RSVP
          with ORP alignment eliminates saccades and reduces regressions, allowing the brain
          to dedicate more resources to comprehension rather than navigation.
        </p>
      </section>

      <section className="about-section">
        <h2>Finding Your Speed</h2>
        <p>
          Average reading speed is around 200-250 words per minute. With practice, many
          RSVP readers comfortably reach 400-600 WPM while maintaining good comprehension.
          Some can push beyond 1000 WPM for familiar material.
        </p>
        <p>
          Start at a comfortable pace and gradually increase. The goal isn't maximum speed—it's
          finding the rate where you absorb information efficiently without strain.
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
      </section>

      <section className="about-section">
        <h2>Tips for Better Results</h2>
        <ul>
          <li>Minimize distractions—RSVP requires focus</li>
          <li>Take breaks every 10-15 minutes to avoid fatigue</li>
          <li>Start with familiar or lighter content when training at higher speeds</li>
          <li>Don't subvocalize (sound out words mentally)—let meaning emerge directly</li>
          <li>Trust the process; comprehension often improves with practice</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>Limitations</h2>
        <p>
          RSVP isn't ideal for all content. Technical material, poetry, or text requiring
          careful analysis may benefit from traditional reading where you can pause and
          re-read naturally. Use Lectio for articles, books, and content where flow matters
          more than deep scrutiny.
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
              Rayner et al. (2016) review psychological research on reading and evaluate speed reading
              methods including RSVP. They find a trade-off between speed and accuracy, noting that
              RSVP prevents the backward eye movements needed to correct comprehension failures.
            </p>
          </li>
          <li>
            <a href="https://doi.org/10.1016/S0022-5371(80)90628-3" target="_blank" rel="noopener noreferrer">
              Subvocalization and Reading for Meaning
            </a>
            <p>
              Slowiaczek &amp; Clifton (1980) demonstrate that subvocalization aids comprehension,
              particularly for integrating concepts across sentences. Blocking inner speech impairs
              reading comprehension but not listening comprehension.
            </p>
          </li>
          <li>
            <a href="https://www.lesswrong.com/posts/bxkEshxKnRde97bmW/the-comprehension-curve" target="_blank" rel="noopener noreferrer">
              The Comprehension Curve
            </a>
            <p>
              This essay argues that each reader has an optimal speed for maximizing comprehension—like
              the Laffer Curve for taxation. Speed reading assumes you're below this optimum, but the
              personal and contextual nature of reading means this isn't always true.
            </p>
          </li>
        </ul>
      </section>
    </div>
  )
}

export default About
