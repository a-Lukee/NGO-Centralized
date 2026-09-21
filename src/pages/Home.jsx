function Home() {
  return (
    <div className="public-page">
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
            <a href="/public-programs" className="primary-button">
              Explore Our Programs
            </a>

            <a
              href="/about"
              className="secondary-button"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section className="intro-section">
        <div className="section-heading">
          <span>ABOUT THE ORGANIZATION</span>
          <h2>Working Together to Create Lasting Impact</h2>
        </div>

        <p>
          Minstrels Rhythm of Hope Inc. works to support
          beneficiaries through educational assistance,
          music programs, and community activities.
        </p>
      </section>

      <section className="home-feature-section">
        <div className="feature-card">
          <h3>Our Programs</h3>
          <p>
            Discover the programs and initiatives that
            support the communities we serve.
          </p>
        </div>

        <div className="feature-card">
          <h3>Our Impact</h3>
          <p>
            Learn about the people and communities reached
            through our programs.
          </p>
        </div>

        <div className="feature-card">
          <h3>Transparency</h3>
          <p>
            Explore public financial information and
            organizational updates.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home