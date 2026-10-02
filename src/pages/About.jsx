import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="public-page">
      {/* PAGE HEADER */}

      <section className="public-page-header">
        <span>ABOUT US</span>

        <h1>About Our Organization</h1>

        <p>
          Learn more about Minstrels Rhythm of Hope Inc.,
          our work, and the communities we support.
        </p>
      </section>

      {/* WHO WE ARE */}

      <section className="about-intro-section">
        <div className="about-intro-grid">
          <div className="about-section-label">
            <span>WHO WE ARE</span>
          </div>

          <div className="about-intro-content">
            <h2>
              Supporting Children and Communities
              Through Meaningful Programs
            </h2>

            <p>
              Minstrels Rhythm of Hope Inc. is an
              organization dedicated to supporting children
              and communities through educational
              assistance, music, and community programs.
            </p>

            <p>
              Through its programs and community
              initiatives, the organization works to provide
              support where it can create meaningful and
              lasting impact.
            </p>
          </div>
        </div>
      </section>

      {/* AREAS OF WORK */}

      <section className="about-work-section">
        <div className="public-section-heading centered">
          <span>OUR WORK</span>

          <h2>How We Support Our Communities</h2>

          <p>
            Our activities focus on practical forms of
            support that contribute to the development and
            well-being of the communities we serve.
          </p>
        </div>

        <div className="about-work-grid">
          <div className="about-work-card">
            <span className="about-work-number">01</span>

            <h3>Educational Assistance</h3>

            <p>
              Supporting beneficiaries through educational
              initiatives and assistance connected to the
              organization's programs.
            </p>
          </div>

          <div className="about-work-card">
            <span className="about-work-number">02</span>

            <h3>Music Programs</h3>

            <p>
              Using music-focused activities as part of the
              organization's efforts to engage and support
              children and communities.
            </p>
          </div>

          <div className="about-work-card">
            <span className="about-work-number">03</span>

            <h3>Community Initiatives</h3>

            <p>
              Organizing programs and activities that
              respond to community needs and encourage
              participation.
            </p>
          </div>
        </div>
      </section>

      {/* RESPONSIBLE STEWARDSHIP */}

      <section className="about-stewardship-section">
        <div className="about-stewardship-content">
          <div>
            <span className="section-eyebrow">
              RESPONSIBLE STEWARDSHIP
            </span>

            <h2>
              Transparency as Part of Our Commitment
            </h2>

            <p>
              This public portal brings together information
              about programs, organizational updates,
              community impact, and summarized financial
              records. By making this information accessible,
              the organization can strengthen communication
              with supporters and the public.
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

      {/* EXPLORE */}

      <section className="about-cta-section">
        <div className="about-cta-content">
          <span className="section-eyebrow">
            OUR PROGRAMS
          </span>

          <h2>See Our Work in Action</h2>

          <p>
            Explore the programs and initiatives managed by
            Minstrels Rhythm of Hope Inc.
          </p>

          <Link
            to="/public-programs"
            className="primary-button"
          >
            Explore Our Programs
          </Link>
        </div>
      </section>
    </div>
  )
}

export default About