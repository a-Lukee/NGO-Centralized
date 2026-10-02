import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="public-page">
      {/* HERO */}

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">
            MINSTRELS RHYTHM OF HOPE INC.
          </span>

          <h1>
            Creating Hope Through
            <br />
            Music and Community
          </h1>

          <p>
            Supporting children and communities through
            educational assistance, music programs, and
            community initiatives.
          </p>

          <div className="hero-actions">
            <Link
              to="/public-programs"
              className="primary-button"
            >
              Explore Our Programs
            </Link>

            <Link
              to="/about"
              className="secondary-button"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}

      <section className="intro-section">
        <div className="public-section-heading">
          <span>ABOUT THE ORGANIZATION</span>

          <h2>
            Working Together to Create Lasting Impact
          </h2>

          <p>
            Minstrels Rhythm of Hope Inc. works to support
            beneficiaries through educational assistance,
            music programs, and community activities that
            strengthen the communities we serve.
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}

      <section className="home-section">
        <div className="public-section-heading centered">
          <span>WHAT WE DO</span>
          <h2>Supporting Communities in Meaningful Ways</h2>
          <p>
            Our work brings together programs, community
            support, and responsible stewardship.
          </p>
        </div>

        <div className="home-feature-section">
          <div className="feature-card">
            <div className="feature-number">01</div>

            <h3>Our Programs</h3>

            <p>
              Discover the programs and initiatives created
              to support children and communities.
            </p>

            <Link
              to="/public-programs"
              className="text-link"
            >
              View Programs →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-number">02</div>

            <h3>Our Impact</h3>

            <p>
              See an overview of the beneficiaries and
              communities reached through our programs.
            </p>

            <Link
              to="/impact"
              className="text-link"
            >
              View Our Impact →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-number">03</div>

            <h3>Transparency</h3>

            <p>
              Review public financial summaries and learn
              how organizational resources are recorded.
            </p>

            <Link
              to="/transparency"
              className="text-link"
            >
              View Transparency →
            </Link>
          </div>
        </div>
      </section>

      {/* TRANSPARENCY MESSAGE */}

      <section className="home-transparency-section">
        <div className="home-transparency-content">
          <div>
            <span className="section-eyebrow">
              ACCOUNTABILITY & TRANSPARENCY
            </span>

            <h2>
              Building Trust Through Responsible
              Stewardship
            </h2>

            <p>
              We believe that accessible information helps
              strengthen trust between the organization,
              its supporters, and the communities it serves.
              Our public portal provides program updates,
              impact information, and summarized financial
              records in one place.
            </p>
          </div>

          <Link
            to="/transparency"
            className="secondary-button"
          >
            View Financial Transparency
          </Link>
        </div>
      </section>

      {/* LATEST UPDATES CTA */}

      <section className="home-updates-section">
        <div className="home-updates-content">
          <span className="section-eyebrow">
            STAY INFORMED
          </span>

          <h2>Follow Our Latest Updates</h2>

          <p>
            Read the latest announcements, program notices,
            and updates from Minstrels Rhythm of Hope Inc.
          </p>

          <Link
            to="/public-announcements"
            className="primary-button"
          >
            View Announcements
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home