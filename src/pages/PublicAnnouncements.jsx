import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function PublicAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select(
        'id, title, content, image_url, published_at'
      )
      .eq('published', true)
      .order('published_at', {
        ascending: false,
      })

    if (error) {
      console.error(
        'Public announcements error:',
        error
      )

      setError('Unable to load announcements.')
    } else {
      setAnnouncements(data || [])
    }

    setLoading(false)
  }

  function formatDate(date) {
    if (!date) return ''

    return new Date(date).toLocaleDateString('en-PH', {
      dateStyle: 'medium',
    })
  }

  return (
    <div className="public-page">
      <section className="public-page-header">
        <span>NEWS & UPDATES</span>
        <h1>Announcements</h1>
        <p>
          Stay updated with the organization's latest
          activities and announcements.
        </p>
      </section>

      {loading && <p>Loading announcements...</p>}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        announcements.length === 0 && (
          <p className="empty-state">
            No announcements have been published yet.
          </p>
        )}

      <div className="announcement-grid">
        {announcements.map((announcement) => (
          <article
            className="announcement-card"
            key={announcement.id}
          >
            {announcement.image_url && (
              <img
                src={announcement.image_url}
                alt=""
              />
            )}

            <div className="announcement-card-content">
              <span>
                {formatDate(announcement.published_at)}
              </span>

              <h2>{announcement.title}</h2>

              <p>{announcement.content}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PublicAnnouncements