import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Sponsorships({ profile }) {
  const [sponsorships, setSponsorships] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    if (!formData.amount || Number(formData.amount) < 0) {
      setError('Please enter a valid sponsorship amount.')
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

    const { error } = await supabase
      .from('sponsorships')
      .delete()
      .eq('id', sponsorship.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the sponsorship.')
      return
    }

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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search sponsorships..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="dashboard-section">
        <strong>
          Showing {filteredSponsorships.length} sponsorship
          {filteredSponsorships.length === 1 ? '' : 's'}
        </strong>

        <span style={{ marginLeft: '20px' }}>
          Total: {formatCurrency(totalSponsorships)}
        </span>
      </div>

      <div className="table-container">
        {loading ? (
          <p className="empty-state">
            Loading sponsorships...
          </p>
        ) : filteredSponsorships.length === 0 ? (
          <p className="empty-state">
            No sponsorships found.
          </p>
        ) : (
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
                  <td>
                    <strong>
                      {sponsorship.sponsor_name}
                    </strong>
                  </td>

                  <td>
                    {formatCurrency(sponsorship.amount)}
                  </td>

                  <td>
                    {sponsorship.sponsorship_date
                      ? new Date(
                          `${sponsorship.sponsorship_date}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td>
                    {sponsorship.description || '—'}
                  </td>

                  <td>
                    {sponsorship.profiles?.full_name || '—'}
                  </td>

                  <td>
                    {canManage && (
                      <button
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
                        className="table-button danger"
                        onClick={() =>
                          handleDelete(sponsorship)
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
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

              <label htmlFor="amount">
                Amount (PHP)
              </label>

              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />

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

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
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
                      ? 'Save Changes'
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