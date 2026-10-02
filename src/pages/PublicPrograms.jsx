import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function PublicPrograms() {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPrograms()
  }, [])

  async function loadPrograms() {
    const { data, error } = await supabase
      .from('programs')
      .select('id, name, description')
      .eq('status', 'active')
      .order('name')

    if (error) {
      console.error('Public programs error:', error)
      setError('Unable to load programs.')
    } else {
      setPrograms(data || [])
    }

    setLoading(false)
  }

  return (
  <div className="public-page">
    {/* PAGE HEADER */}

    <section className="public-page-header">
      <span>OUR PROGRAMS</span>

      <h1>Programs and Initiatives</h1>

      <p>
        Explore the programs and initiatives currently
        being carried out by Minstrels Rhythm of Hope Inc.
      </p>
    </section>

    {/* PROGRAMS */}

    <section className="public-programs-section">
      <div className="public-programs-container">
        <div className="public-programs-intro">
          <div>
            <span className="section-eyebrow">
              CURRENT PROGRAMS
            </span>

            <h2>Supporting Our Communities</h2>

            <p>
              These are the active programs currently
              managed by the organization.
            </p>
          </div>

          {!loading && !error && programs.length > 0 && (
            <span className="public-program-count">
              {programs.length}{' '}
              {programs.length === 1 ? 'Program' : 'Programs'}
            </span>
          )}
        </div>

        {loading && (
          <div className="public-loading-state">
            <div className="loading-spinner" />
            <p>Loading programs...</p>
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

        {!loading && !error && programs.length === 0 && (
          <div className="public-empty-state">
            <h3>No Active Programs</h3>

            <p>
              There are no active programs available to
              display at this time. Please check back for
              future updates.
            </p>
          </div>
        )}

        {!loading && !error && programs.length > 0 && (
          <div className="public-program-grid">
            {programs.map((program, index) => (
              <article
                className="public-program-card"
                key={program.id}
              >
                <div className="public-program-card-top">
                  <span className="public-program-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="public-program-status">
                    Active
                  </span>
                </div>

                <h3>{program.name}</h3>

                <p>
                  {program.description ||
                    'Program information will be available soon.'}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  </div>
)
}

export default PublicPrograms