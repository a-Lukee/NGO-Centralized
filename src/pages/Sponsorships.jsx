import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Sponsorships({ profile }) {
  const [sponsorships, setSponsorships] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingSponsorship, setEditingSponsorship] = useState(null)

  const [formData, setFormData] = useState({
    sponsor_name: '',
    amount: '',
    sponsorship_date: '',
    description: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSponsorships()
  }, [])

  async function loadSponsorships() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('sponsorships')
      .select(`
        *,
        profiles (
          id,
          full_name
        )
      `)
      .order('sponsorship_date', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
      setError('Unable to load sponsorships.')
      setLoading(false)
      return
    }

    setSponsorships(data || [])
    setLoading(false)
  }

  function openAddForm() {
    setSuccess('')
    setEditingSponsorship(null)

    setFormData({
      sponsor_name: '',
      amount: '',
      sponsorship_date: new Date()
        .toISOString()
        .split('T')[0],
      description: '',
      notes: '',
    })

    setShowForm(true)
    setError('')
  }

  function openEditForm(sponsorship) {
    setSuccess('')
    setEditingSponsorship(sponsorship)

    setFormData({
      sponsor_name: sponsorship.sponsor_name,
      amount: sponsorship.amount,
      sponsorship_date:
        sponsorship.sponsorship_date || '',
      description: sponsorship.description || '',
      notes: sponsorship.notes || '',
    })

    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingSponsorship(null)

    setFormData({
      sponsor_name: '',
      amount: '',
      sponsorship_date: '',
      description: '',
      notes: '',
    })
  }

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formData.sponsor_name.trim()) {
      setError('Sponsor name is required.')
      return
    }

    if (
  !formData.amount ||
  Number(formData.amount) <= 0
) {
  setError('Sponsorship amount must be greater than zero.')
  return
}

    setSaving(true)
    setError('')

    const sponsorshipData = {
      sponsor_name: formData.sponsor_name.trim(),
      amount: Number(formData.amount),
      sponsorship_date:
        formData.sponsorship_date ||
        new Date().toISOString().split('T')[0],
      description:
        formData.description.trim() || null,
      notes:
        formData.notes.trim() || null,
    }

    if (editingSponsorship) {
      const { error } = await supabase
        .from('sponsorships')
        .update(sponsorshipData)
        .eq('id', editingSponsorship.id)

      if (error) {
        console.error(error)
        setError('Unable to update the sponsorship.')
        setSaving(false)
        return
      }
    } else {
      const { data: userData } =
        await supabase.auth.getUser()

      if (!userData.user) {
        setError(
          'You must be logged in to record a sponsorship.'
        )
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('sponsorships')
        .insert({
          ...sponsorshipData,
          recorded_by: userData.user.id,
        })

      if (error) {
        console.error(error)
        setError('Unable to create the sponsorship.')
        setSaving(false)
        return
      }
    }

    setSuccess(
  editingSponsorship
    ? 'Sponsorship updated successfully.'
    : 'Sponsorship recorded successfully.'
)

await loadSponsorships()
closeForm()
setSaving(false)
  }

  async function handleDelete(sponsorship) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the sponsorship from "${sponsorship.sponsor_name}"?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('sponsorships')
      .delete()
      .eq('id', sponsorship.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the sponsorship.')
      return
    }

    setSuccess('Sponsorship deleted successfully.')
    await loadSponsorships()
  }

  const filteredSponsorships = sponsorships.filter(
    (sponsorship) => {
      const searchTerm = search.toLowerCase()

      return (
        sponsorship.sponsor_name
          .toLowerCase()
          .includes(searchTerm) ||
        (sponsorship.description || '')
          .toLowerCase()
          .includes(searchTerm) ||
        (sponsorship.notes || '')
          .toLowerCase()
          .includes(searchTerm)
      )
    }
  )

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(Number(amount || 0))
  }

  const totalSponsorships = filteredSponsorships.reduce(
    (total, sponsorship) =>
      total + Number(sponsorship.amount || 0),
    0
  )

  const canManage =
    profile?.role === 'admin' ||
    profile?.role === 'finance'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sponsorships</h1>
          <p>
            Record and manage sponsorships received by the
            organization.
          </p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Sponsorship
          </button>
        )}
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

      <div className="page-toolbar sponsorships-toolbar">
  <div className="search-field">
    <input
      type="search"
      aria-label="Search sponsorships"
      placeholder="Search sponsorships..."
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
    />
  </div>

  {!loading && (
    <div className="financial-toolbar-summary">
      <span className="toolbar-count">
        {filteredSponsorships.length}{' '}
        {filteredSponsorships.length === 1
          ? 'sponsorship'
          : 'sponsorships'}
      </span>

      <strong className="toolbar-total">
        {formatCurrency(totalSponsorships)}
      </strong>
    </div>
  )}
</div>

        {loading ? (
  <div
    className="content-state"
    role="status"
  >
    <div className="loading-spinner"></div>

    <div>
      <strong>Loading sponsorships</strong>
      <span>
        Please wait while we retrieve the latest financial records.
      </span>
    </div>
  </div>
) : filteredSponsorships.length === 0 ? (
  <div className="content-state">
    <div>
      <strong>
        {search
          ? 'No matching sponsorships'
          : 'No sponsorships yet'}
      </strong>

      <span>
        {search
          ? 'No sponsorships match your current search.'
          : canManage
            ? 'Record your first sponsorship to get started.'
            : 'There are currently no sponsorships to display.'}
      </span>
    </div>

    {search && (
      <button
        type="button"
        className="secondary-button"
        onClick={() => setSearch('')}
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
                <th>Sponsor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Recorded By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSponsorships.map((sponsorship) => (
                <tr key={sponsorship.id}>
                  <td className="sponsorship-sponsor-cell">
                    <strong>
                      {sponsorship.sponsor_name}
                    </strong>
                  </td>

                  <td className="sponsorship-amount-cell">
                    <strong>
                      {formatCurrency(sponsorship.amount)}
                    </strong>
                  </td>

                  <td>
                    {sponsorship.sponsorship_date
                      ? new Date(
                          `${sponsorship.sponsorship_date}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td className="sponsorship-description-cell">
                    <strong>
                      {sponsorship.description || '—'}
                    </strong>
                  </td>

                  <td>
                    {sponsorship.profiles?.full_name || '—'}
                  </td>

                  <td>

                  <div className="action-buttons">
    {canManage && (
      <button
        type="button"
        className="table-button"
        onClick={() =>
          openEditForm(sponsorship)
        }
      >
        Edit
      </button>
    )}

    {profile?.role === 'admin' && (
      <button
        type="button"
        className="table-button danger"
        onClick={() =>
          handleDelete(sponsorship)
        }
      >
        Delete
      </button>
    )}
  </div>
</td>
                </tr>
              ))}
            </tbody>
          </table>
  </div>
)}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingSponsorship
                  ? 'Edit Sponsorship'
                  : 'Add Sponsorship'}
              </h2>

              <button
  type="button"
  className="close-button"
  onClick={closeForm}
  aria-label="Close sponsorship form"
>
  ×
</button>
            </div>

                  <form onSubmit={handleSubmit}>
            <div className="form-group">
  <label htmlFor="sponsor_name">
    Sponsor Name
  </label>

  <input
    id="sponsor_name"
    name="sponsor_name"
    type="text"
    value={formData.sponsor_name}
    onChange={handleChange}
    placeholder="Enter sponsor name"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="amount">
    Amount (PHP)
  </label>

  <input
    id="amount"
    name="amount"
    type="number"
    min="0.01"
    step="0.01"
    value={formData.amount}
    onChange={handleChange}
    placeholder="0.00"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="sponsorship_date">
    Sponsorship Date
  </label>

  <input
    id="sponsorship_date"
    name="sponsorship_date"
    type="date"
    value={formData.sponsorship_date}
    onChange={handleChange}
    required
  />
</div>

<div className="form-group">
  <label htmlFor="description">
    Description
  </label>

  <input
    id="description"
    name="description"
    type="text"
    value={formData.description}
    onChange={handleChange}
    placeholder="Describe the sponsorship"
  />
</div>

<div className="form-group">
  <label htmlFor="notes">
    Notes
  </label>

  <textarea
    id="notes"
    name="notes"
    value={formData.notes}
    onChange={handleChange}
    placeholder="Optional notes"
    rows="5"
  />
</div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingSponsorship
                      ? 'Update Sponsorship'
                      : 'Record Sponsorship'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  )
}

export default Sponsorships