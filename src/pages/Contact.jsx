function Contact() {
  return (
    <div className="public-page">
      {/* PAGE HEADER */}

      <section className="public-page-header">
        <span>CONTACT</span>

        <h1>Get in Touch</h1>

        <p>
          Have a question or want to learn more about
          Minstrels Rhythm of Hope Inc.? Find the
          organization's public communication information
          here.
        </p>
      </section>

      {/* CONTACT CONTENT */}

      <section className="public-contact-section">
        <div className="public-contact-container">
          <div className="public-contact-intro">
            <span className="section-eyebrow">
              CONTACT US
            </span>

            <h2>Connect With Our Organization</h2>

            <p>
              For questions about our programs, activities,
              or public information, you may reach the
              organization through its official
              communication channels.
            </p>
          </div>

          <div className="public-contact-grid">
            <div className="public-contact-card">
              <span className="public-contact-label">
                EMAIL
              </span>

              <h3>Email Address</h3>

              <p>
                Official email information will be
                available here.
              </p>
            </div>

            <div className="public-contact-card">
              <span className="public-contact-label">
                PHONE
              </span>

              <h3>Contact Number</h3>

              <p>
                Official contact number will be available
                here.
              </p>
            </div>

            <div className="public-contact-card">
              <span className="public-contact-label">
                LOCATION
              </span>

              <h3>Organization Address</h3>

              <p>
                Official organization address will be
                available here.
              </p>
            </div>
          </div>

          <div className="contact-information-note">
            <div>
              <span className="section-eyebrow">
                PUBLIC COMMUNICATION
              </span>

              <h2>We're Here to Help</h2>

              <p>
                Contact details shown on this page are
                intended for public inquiries and
                communication with the organization.
              </p>
            </div>

            <div className="contact-note-card">
              <span>PLEASE NOTE</span>

              <p>
                Official contact information should be
                confirmed by the organization before being
                published on this website.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact