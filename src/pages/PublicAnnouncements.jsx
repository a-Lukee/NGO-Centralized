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
    {/* PAGE HEADER */}

    <section className="public-page-header">
      <span>NEWS & UPDATES</span>

      <h1>Announcements</h1>

      <p>
        Stay informed about the latest activities,
        programs, and updates from Minstrels Rhythm of
        Hope Inc.
      </p>
    </section>

    {/* ANNOUNCEMENTS */}

    <section className="public-announcements-section">
      <div className="public-announcements-container">
        <div className="public-announcements-intro">
          <div>
            <span className="section-eyebrow">
              LATEST UPDATES
            </span>

            <h2>News From Our Organization</h2>

            <p>
              Follow the latest announcements and updates
              published by the organization.
            </p>
          </div>

          {!loading &&
            !error &&
            announcements.length > 0 && (
              <span className="public-announcement-count">
                {announcements.length}{' '}
                {announcements.length === 1
                  ? 'Announcement'
                  : 'Announcements'}
              </span>
            )}
        </div>

        {loading && (
          <div className="public-loading-state">
            <div className="loading-spinner" />
            <p>Loading announcements...</p>
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

        {!loading &&
          !error &&
          announcements.length === 0 && (
            <div className="public-empty-state">
              <h3>No Announcements Yet</h3>

              <p>
                There are no published announcements
                available at this time. Please check back
                for future updates.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          announcements.length > 0 && (
            <div className="public-announcement-grid">
              {announcements.map((announcement) => (
                <article
                  className={`public-announcement-card ${
                    announcement.image_url
                      ? 'has-image'
                      : 'no-image'
                  }`}
                  key={announcement.id}
                >
                  {announcement.image_url && (
                    <div className="public-announcement-image">
                      <img
                        src={announcement.image_url}
                        alt=""
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="public-announcement-content">
                    <div className="public-announcement-meta">
                      <span>ANNOUNCEMENT</span>

                      {announcement.published_at && (
                        <time
                          dateTime={
                            announcement.published_at
                          }
                        >
                          {formatDate(
                            announcement.published_at
                          )}
                        </time>
                      )}
                    </div>

                    <h3>{announcement.title}</h3>

                    <p>{announcement.content}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
      </div>
    </section>
  </div>
)
}

export default PublicAnnouncements