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
      <section className="public-page-header">
        <span>OUR PROGRAMS</span>
        <h1>Programs and Initiatives</h1>
        <p>
          Learn about the programs currently being carried
          out by the organization.
        </p>
      </section>

      {loading && <p>Loading programs...</p>}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading && !error && programs.length === 0 && (
        <p className="empty-state">
          No active programs are currently available.
        </p>
      )}

      <div className="public-card-grid">
        {programs.map((program) => (
          <article
            className="public-card"
            key={program.id}
          >
            <h2>{program.name}</h2>

            <p>
              {program.description ||
                'Program information will be available soon.'}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PublicPrograms