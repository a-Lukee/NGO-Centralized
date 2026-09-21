import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Donations({ profile }) {
  const [donations, setDonations] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingDonation, setEditingDonation] = useState(null)

  const [formData, setFormData] = useState({
    donor_name: '',
    amount: '',
    donation_date: '',
    payment_method: '',
    purpose: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadDonations()
  }, [])

  async function loadDonations() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        profiles (
          id,
          full_name
        )
      `)
      .order('donation_date', {
        ascending: false,
      })
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
      setError('Unable to load donations.')
      setLoading(false)
      return
    }

    setDonations(data || [])
    setLoading(false)
  }

  function openAddForm() {
    setEditingDonation(null)

    setFormData({
      donor_name: '',
      amount: '',
      donation_date: new Date()
        .toISOString()
        .split('T')[0],
      payment_method: '',
      purpose: '',
      notes: '',
    })

    setShowForm(true)
    setError('')
  }

  function openEditForm(donation) {
    setEditingDonation(donation)

    setFormData({
      donor_name: donation.donor_name,
      amount: donation.amount,
      donation_date: donation.donation_date || '',
      payment_method: donation.payment_method || '',
      purpose: donation.purpose || '',
      notes: donation.notes || '',
    })

    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingDonation(null)

    setFormData({
      donor_name: '',
      amount: '',
      donation_date: '',
      payment_method: '',
      purpose: '',
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

    if (!formData.donor_name.trim()) {
      setError('Donor name is required.')
      return
    }

    if (!formData.amount || Number(formData.amount) < 0) {
      setError('Please enter a valid donation amount.')
      return
    }

    setSaving(true)
    setError('')

    const donationData = {
      donor_name: formData.donor_name.trim(),
      amount: Number(formData.amount),
      donation_date:
        formData.donation_date ||
        new Date().toISOString().split('T')[0],
      payment_method:
        formData.payment_method.trim() || null,
      purpose:
        formData.purpose.trim() || null,
      notes:
        formData.notes.trim() || null,
    }

    if (editingDonation) {
      const { error } = await supabase
        .from('donations')
        .update(donationData)
        .eq('id', editingDonation.id)

      if (error) {
        console.error(error)
        setError('Unable to update the donation.')
        setSaving(false)
        return
      }
    } else {
      const { data: userData } =
        await supabase.auth.getUser()

      if (!userData.user) {
        setError('You must be logged in to record a donation.')
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('donations')
        .insert({
          ...donationData,
          recorded_by: userData.user.id,
        })

      if (error) {
        console.error(error)
        setError('Unable to create the donation.')
        setSaving(false)
        return
      }
    }

    await loadDonations()
    closeForm()
    setSaving(false)
  }

  async function handleDelete(donation) {
    const confirmed = window.confirm(
      `Are you sure you want to delete the donation from "${donation.donor_name}"?`
    )

    if (!confirmed) return

    setError('')

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', donation.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the donation.')
      return
    }

    await loadDonations()
  }

  const filteredDonations = donations.filter((donation) => {
    const searchTerm = search.toLowerCase()

    return (
      donation.donor_name
        .toLowerCase()
        .includes(searchTerm) ||
      (donation.purpose || '')
        .toLowerCase()
        .includes(searchTerm) ||
      (donation.payment_method || '')
        .toLowerCase()
        .includes(searchTerm)
    )
  })

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(Number(amount || 0))
  }

  const totalDonations = filteredDonations.reduce(
    (total, donation) =>
      total + Number(donation.amount || 0),
    0
  )

  const canManage =
    profile?.role === 'admin' ||
    profile?.role === 'finance'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Donations</h1>
          <p>
            Record and manage donations received by the
            organization.
          </p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Donation
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
          placeholder="Search donations..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </div>

      <div className="dashboard-section">
        <strong>
          Showing {filteredDonations.length} donation
          {filteredDonations.length === 1 ? '' : 's'}
        </strong>

        <span style={{ marginLeft: '20px' }}>
          Total: {formatCurrency(totalDonations)}
        </span>
      </div>

      <div className="table-container">
        {loading ? (
          <p className="empty-state">
            Loading donations...
          </p>
        ) : filteredDonations.length === 0 ? (
          <p className="empty-state">
            No donations found.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Purpose</th>
                <th>Recorded By</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation.id}>
                  <td>
                    <strong>
                      {donation.donor_name}
                    </strong>
                  </td>

                  <td>
                    {formatCurrency(donation.amount)}
                  </td>

                  <td>
                    {donation.donation_date
                      ? new Date(
                          `${donation.donation_date}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td>
                    {donation.payment_method || '—'}
                  </td>

                  <td>
                    {donation.purpose || '—'}
                  </td>

                  <td>
                    {donation.profiles?.full_name || '—'}
                  </td>

                  <td>
                    {canManage && (
                      <button
                        className="table-button"
                        onClick={() =>
                          openEditForm(donation)
                        }
                      >
                        Edit
                      </button>
                    )}

                    {profile?.role === 'admin' && (
                      <button
                        className="table-button danger"
                        onClick={() =>
                          handleDelete(donation)
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
                {editingDonation
                  ? 'Edit Donation'
                  : 'Add Donation'}
              </h2>

              <button
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="donor_name">
                Donor Name
              </label>

              <input
                id="donor_name"
                name="donor_name"
                type="text"
                value={formData.donor_name}
                onChange={handleChange}
                placeholder="Enter donor name"
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

              <label htmlFor="donation_date">
                Donation Date
              </label>

              <input
                id="donation_date"
                name="donation_date"
                type="date"
                value={formData.donation_date}
                onChange={handleChange}
                required
              />

              <label htmlFor="payment_method">
                Payment Method
              </label>

              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option value="">
                  Select Payment Method
                </option>

                <option value="Cash">
                  Cash
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Check">
                  Check
                </option>

                <option value="Online">
                  Online
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <label htmlFor="purpose">
                Purpose
              </label>

              <input
                id="purpose"
                name="purpose"
                type="text"
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Educational assistance"
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
                    : editingDonation
                      ? 'Save Changes'
                      : 'Record Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Donations