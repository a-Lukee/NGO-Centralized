import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Impact() {
  const [impactData, setImpactData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadImpactSummary()
  }, [])

  async function loadImpactSummary() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'get_public_impact_summary'
    )

    if (error) {
      console.error(
        'Public impact summary error:',
        error
      )

      setError(
        'Unable to load impact information.'
      )

      setLoading(false)
      return
    }

    if (data && data.length > 0) {
      setImpactData(data[0])
    }

    setLoading(false)
  }

  return (
  <div className="public-page">
    {/* PAGE HEADER */}

    <section className="public-page-header">
      <span>OUR IMPACT</span>

      <h1>Our Impact</h1>

      <p>
        An aggregate overview of the programs and
        beneficiaries supported through the work of
        Minstrels Rhythm of Hope Inc.
      </p>
    </section>

    {/* IMPACT CONTENT */}

    <section className="public-impact-section">
      <div className="public-impact-container">
        <div className="public-impact-intro">
          <span className="section-eyebrow">
            IMPACT OVERVIEW
          </span>

          <h2>Our Work at a Glance</h2>

          <p>
            These figures are generated from records
            maintained within the organization's centralized
            management system.
          </p>
        </div>

        {loading && (
          <div className="public-loading-state">
            <div className="loading-spinner" />
            <p>Loading impact information...</p>
          </div>
        )}

        {error && (
          <div
            className="feedback-message feedback-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!loading && !error && !impactData && (
          <div className="public-empty-state">
            <h3>Impact Information Unavailable</h3>

            <p>
              Impact information is not available to
              display at this time. Please check back later.
            </p>
          </div>
        )}

        {!loading && !error && impactData && (
          <>
            <div className="public-impact-grid">
              <article className="public-impact-card">
                <span className="public-impact-label">
                  PROGRAMS
                </span>

                <strong>
                  {impactData.active_programs ?? 0}
                </strong>

                <p>Active Programs</p>
              </article>

              <article className="public-impact-card">
                <span className="public-impact-label">
                  REACH
                </span>

                <strong>
                  {impactData.total_beneficiaries ?? 0}
                </strong>

                <p>Total Beneficiaries</p>
              </article>

              <article className="public-impact-card">
                <span className="public-impact-label">
                  CURRENT
                </span>

                <strong>
                  {impactData.active_beneficiaries ?? 0}
                </strong>

                <p>Active Beneficiaries</p>
              </article>

              <article className="public-impact-card">
                <span className="public-impact-label">
                  COMPLETED
                </span>

                <strong>
                  {impactData.completed_beneficiaries ?? 0}
                </strong>

                <p>Completed Beneficiaries</p>
              </article>
            </div>

            <div className="impact-explanation">
              <div className="impact-explanation-content">
                <span className="section-eyebrow">
                  UNDERSTANDING THE NUMBERS
                </span>

                <h2>Making a Difference</h2>

                <p>
                  These figures provide an aggregate overview
                  of the organization's current programs and
                  beneficiary support. They are based on
                  records maintained within the centralized
                  system.
                </p>
              </div>

              <div className="impact-privacy-note">
                <span className="impact-privacy-label">
                  PRIVACY
                </span>

                <h3>Beneficiary Information is Protected</h3>

                <p>
                  Individual beneficiary information is kept
                  private and is not displayed on this public
                  page. Only summarized information is shown
                  publicly.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  </div>
)
}

export default Impact