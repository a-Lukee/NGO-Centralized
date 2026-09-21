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
      <section className="public-page-header">
        <span>OUR IMPACT</span>

        <h1>Our Impact</h1>

        <p>
          A summary of the programs and beneficiaries
          supported through the organization's work.
        </p>
      </section>

      {loading && (
        <p>
          Loading impact information...
        </p>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && impactData && (
        <>
          <section className="impact-grid">
            <div className="impact-card">
              <h2>
                {impactData.active_programs}
              </h2>
              <p>Active Programs</p>
            </div>

            <div className="impact-card">
              <h2>
                {impactData.total_beneficiaries}
              </h2>
              <p>Total Beneficiaries</p>
            </div>

            <div className="impact-card">
              <h2>
                {impactData.active_beneficiaries}
              </h2>
              <p>Active Beneficiaries</p>
            </div>

            <div className="impact-card">
              <h2>
                {impactData.completed_beneficiaries}
              </h2>
              <p>Completed Beneficiaries</p>
            </div>
          </section>

          <section className="public-content-section">
            <h2>Making a Difference</h2>

            <p>
              These figures provide an aggregate overview
              of the organization's current programs and
              beneficiary support. They are based on
              records maintained within the centralized
              system.
            </p>

            <p className="public-note">
              Individual beneficiary information is kept
              private and is not displayed on this public
              page.
            </p>
          </section>
        </>
      )}
    </div>
  )
}

export default Impact