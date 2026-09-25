import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Announcements({ profile }) {
  const [announcements, setAnnouncements] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [editingId, setEditingId] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canManage =
    profile?.role === 'admin' ||
    profile?.role === 'program_coordinator'

  const canDelete =
    profile?.role === 'admin'

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function loadAnnouncements() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        image_url,
        published,
        published_at,
        created_at,
        created_by,
        profiles (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(
        'Announcements load error:',
        error
      )

      setError(
        'Unable to load announcements.'
      )

      setLoading(false)
      return
    }

    setAnnouncements(data || [])
    setLoading(false)
  }

  function resetForm() {
    setTitle('')
    setContent('')
    setPublished(false)
    setImageFile(null)
    setImagePreview('')
    setExistingImageUrl('')
    setEditingId(null)
    setError('')
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ]

    if (!allowedTypes.includes(file.type)) {
      setError(
        'Please select a JPG, PNG, WEBP, or GIF image.'
      )

      event.target.value = ''
      return
    }

    const maxSize = 5 * 1024 * 1024

    if (file.size > maxSize) {
      setError(
        'Image size must be 5 MB or less.'
      )

      event.target.value = ''
      return
    }

    setError('')
    setImageFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  async function uploadImage(file) {
    if (!file) {
      return null
    }

    const fileExtension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const fileName =
      `${crypto.randomUUID()}.${fileExtension}`

    const filePath = `announcements/${fileName}`

    const { error } = await supabase.storage
      .from('announcement-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw error
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from('announcement-images')
      .getPublicUrl(filePath)

    return {
      url: publicUrlData.publicUrl,
      path: filePath,
    }
  }

  function getStoragePathFromUrl(url) {
    if (!url) {
      return null
    }

    const marker =
      '/storage/v1/object/public/announcement-images/'

    const markerIndex = url.indexOf(marker)

    if (markerIndex === -1) {
      return null
    }

    return decodeURIComponent(
      url.substring(
        markerIndex + marker.length
      )
    )
  }

  async function deleteImageByPath(path) {
    if (!path) {
      return
    }

    const { error } = await supabase.storage
      .from('announcement-images')
      .remove([path])

    if (error) {
      console.error(
        'Image deletion error:',
        error
      )
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canManage) {
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = existingImageUrl || null
      let uploadedImagePath = null

      if (imageFile) {
        const uploadedImage =
          await uploadImage(imageFile)

        imageUrl = uploadedImage.url
        uploadedImagePath =
          uploadedImage.path
      }

      const now = new Date().toISOString()

      if (editingId) {
        const updateData = {
          title,
          content,
          published,
          published_at: published
            ? (
                announcements.find(
                  (item) => item.id === editingId
                )?.published_at || now
              )
            : null,
          image_url: imageUrl,
          updated_at: now,
        }

        const { error } = await supabase
          .from('announcements')
          .update(updateData)
          .eq('id', editingId)

        if (error) {
          if (uploadedImagePath) {
            await deleteImageByPath(
              uploadedImagePath
            )
          }

          throw error
        }

        if (
          imageFile &&
          existingImageUrl
        ) {
          const oldImagePath =
            getStoragePathFromUrl(
              existingImageUrl
            )

          if (oldImagePath) {
            await deleteImageByPath(
              oldImagePath
            )
          }
        }

        setSuccess(
          'Announcement updated successfully.'
        )
      } else {
        const {
          data: {
            user,
          },
        } = await supabase.auth.getUser()

        const { error } = await supabase
          .from('announcements')
          .insert({
            title,
            content,
            image_url: imageUrl,
            published,
            published_at: published
              ? now
              : null,
            created_by: user?.id || null,
          })

        if (error) {
          if (uploadedImagePath) {
            await deleteImageByPath(
              uploadedImagePath
            )
          }

          throw error
        }

        setSuccess(
          'Announcement created successfully.'
        )
      }

      resetForm()
      await loadAnnouncements()
    } catch (err) {
      console.error(
        'Announcement save error:',
        err
      )

      setError(
        err.message ||
        'Unable to save announcement.'
      )
    } finally {
      setSaving(false)
    }
  }

  function handleEdit(announcement) {
    setEditingId(announcement.id)
    setTitle(announcement.title)
    setContent(announcement.content)
    setPublished(announcement.published)
    setExistingImageUrl(
      announcement.image_url || ''
    )
    setImageFile(null)
    setImagePreview(
      announcement.image_url || ''
    )
    setError('')
    setSuccess('')

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function handleDelete(announcement) {
    if (!canDelete) {
      return
    }

    const confirmed = window.confirm(
      `Delete "${announcement.title}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')
    setSuccess('')

    try {
      const imagePath =
        getStoragePathFromUrl(
          announcement.image_url
        )

      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', announcement.id)

      if (error) {
        throw error
      }

      if (imagePath) {
        await deleteImageByPath(imagePath)
      }

      setSuccess(
        'Announcement deleted successfully.'
      )

      await loadAnnouncements()
    } catch (err) {
      console.error(
        'Announcement delete error:',
        err
      )

      setError(
        err.message ||
        'Unable to delete announcement.'
      )
    }
  }

  const filteredAnnouncements =
    announcements.filter((announcement) => {
      const search =
        searchTerm.toLowerCase()

      return (
        announcement.title
          .toLowerCase()
          .includes(search) ||
        announcement.content
          .toLowerCase()
          .includes(search)
      )
    })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Announcements</h1>
          <p>
            Manage public announcements and updates.
          </p>
        </div>
      </div>

      {success && (
  <div
    className="feedback-message feedback-success"
    role="status"
  >
    <div>
      <strong>Success</strong>
      <span>{success}</span>
    </div>
  </div>
)}

{error && (
  <div
    className="feedback-message feedback-error"
    role="alert"
  >
    <div>
      <strong>Something went wrong</strong>
      <span>{error}</span>
    </div>
  </div>
)}

      {canManage && (
        <form
          className="form-card"
          onSubmit={handleSubmit}
        >
          <div className="form-card-header">
  <div>
    <h2>
      {editingId
        ? 'Edit Announcement'
        : 'Create Announcement'}
    </h2>

    <p>
      {editingId
        ? 'Update the announcement details and publishing status.'
        : 'Create an update that can be published on the public website.'}
    </p>
  </div>

  {editingId && (
    <span className="editing-badge">
      Editing
    </span>
  )}
</div>

          <div className="form-group">
            <label htmlFor="announcement-title">
              Title
            </label>

            <input
              id="announcement-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="announcement-content">
              Content
            </label>

            <textarea
              id="announcement-content"
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              rows="7"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="announcement-image">
              Announcement Image
            </label>

            <input
              id="announcement-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageChange}
            />

            <small>
              Optional. JPG, PNG, WEBP, or GIF.
              Maximum size: 5 MB.
            </small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img
                src={imagePreview}
                alt="Announcement preview"
              />
            </div>
          )}

          <div className="publish-control">
  <label>
    <input
      type="checkbox"
      checked={published}
      onChange={(event) =>
        setPublished(event.target.checked)
      }
    />

    <span>
      <strong>Publish announcement</strong>
      <small>
        Published announcements are visible on the public website.
      </small>
    </span>
  </label>
</div>

          <div className="form-actions">
  <button
    type="submit"
    className="primary-button"
    disabled={saving}
  >
    {saving
      ? 'Saving...'
      : editingId
        ? 'Update Announcement'
        : 'Create Announcement'}
  </button>

  {editingId && (
    <button
      type="button"
      className="secondary-button"
      onClick={resetForm}
      disabled={saving}
    >
      Cancel
    </button>
  )}
</div>
        </form>
      )}

      <div className="page-toolbar">
  <div className="search-field">
    <input
      type="search"
      aria-label="Search announcements"
      placeholder="Search announcements..."
      value={searchTerm}
      onChange={(event) =>
        setSearchTerm(event.target.value)
      }
    />
  </div>

  {!loading && (
    <span className="toolbar-count">
      {filteredAnnouncements.length}{' '}
      {filteredAnnouncements.length === 1
        ? 'announcement'
        : 'announcements'}
    </span>
  )}
</div>

      {loading ? (
  <div
    className="content-state"
    role="status"
  >
    <div className="loading-spinner"></div>

    <div>
      <strong>Loading announcements</strong>
      <span>Please wait while we retrieve the latest records.</span>
    </div>
  </div>
) : filteredAnnouncements.length === 0 ? (
  <div className="content-state">
    <div>
      <strong>
        {searchTerm
          ? 'No matching announcements'
          : 'No announcements yet'}
      </strong>

      <span>
        {searchTerm
          ? `No announcements match "${searchTerm}".`
          : canManage
            ? 'Create your first announcement using the form above.'
            : 'There are currently no announcements to display.'}
      </span>
    </div>

    {searchTerm && (
      <button
        type="button"
        className="secondary-button"
        onClick={() => setSearchTerm('')}
      >
        Clear Search
      </button>
    )}
  </div>
) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Published</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAnnouncements.map(
                (announcement) => (
                  <tr key={announcement.id}>
                    <td>
                      {announcement.image_url ? (
                        <img
                          src={
                            announcement.image_url
                          }
                          alt=""
                          className="announcement-thumbnail"
                        />
                      ) : (
                        <span className="no-image-label">
    No image
  </span>
                      )}
                    </td>

                    <td className="announcement-title-cell">
  <strong>
    {announcement.title}
  </strong>
</td>

                    <td>
                      <span
                        className={`status-badge ${
                          announcement.published
                            ? 'active'
                            : 'inactive'
                        }`}
                      >
                        {announcement.published
                          ? 'Published'
                          : 'Draft'}
                      </span>
                    </td>

                    <td>
                      {announcement.published_at
                        ? new Date(
                            announcement.published_at
                          ).toLocaleDateString()
                        : '—'}
                    </td>

                    <td>
                      {announcement.profiles
                        ?.full_name || '—'}
                    </td>

                    <td>
                      <div className="action-buttons">
                        {canManage && (
                          <button
                            type="button"
                            className="table-button"
                            onClick={() =>
                              handleEdit(
                                announcement
                              )
                            }
                          >
                            Edit
                          </button>
                        )}

                        {canDelete && (
                          <button
                            type="button"
                            className="table-button danger"
                            onClick={() =>
                              handleDelete(
                                announcement
                              )
                            }
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Announcements