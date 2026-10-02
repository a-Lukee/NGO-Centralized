import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Beneficiaries({ profile }) {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [programs, setPrograms] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState(null)

  const [formData, setFormData] = useState({
    full_name: '',
    program_id: '',
    status: 'active',
    date_registered: '',
    notes: '',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')

    const [beneficiariesResult, programsResult] = await Promise.all([
      supabase
        .from('beneficiaries')
        .select(`
          *,
          programs (
            id,
            name
          )
        `)
        .order('created_at', {
          ascending: false,
        }),

      supabase
        .from('programs')
        .select('id, name, status')
        .order('name', {
          ascending: true,
        }),
    ])

    if (beneficiariesResult.error) {
      console.error(beneficiariesResult.error)
      setError('Unable to load beneficiaries.')
      setLoading(false)
      return
    }

    if (programsResult.error) {
      console.error(programsResult.error)
      setError('Unable to load programs.')
      setLoading(false)
      return
    }

    setBeneficiaries(beneficiariesResult.data || [])
    setPrograms(programsResult.data || [])

    setLoading(false)
  }

  function openAddForm() {
    setSuccess('')
    setEditingBeneficiary(null)

    setFormData({
      full_name: '',
      program_id: '',
      status: 'active',
      date_registered: new Date().toISOString().split('T')[0],
      notes: '',
    })

    setShowForm(true)
    setError('')
  }

  function openEditForm(beneficiary) {
    setSuccess('')
    setEditingBeneficiary(beneficiary)

    setFormData({
      full_name: beneficiary.full_name,
      program_id: beneficiary.program_id
        ? String(beneficiary.program_id)
        : '',
      status: beneficiary.status,
      date_registered: beneficiary.date_registered || '',
      notes: beneficiary.notes || '',
    })

    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingBeneficiary(null)

    setFormData({
      full_name: '',
      program_id: '',
      status: 'active',
      date_registered: '',
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

    if (!formData.full_name.trim()) {
      setError('Beneficiary name is required.')
      return
    }

    setSaving(true)
    setError('')

    const beneficiaryData = {
      full_name: formData.full_name.trim(),
      program_id: formData.program_id
        ? Number(formData.program_id)
        : null,
      status: formData.status,
      date_registered:
        formData.date_registered ||
        new Date().toISOString().split('T')[0],
      notes: formData.notes.trim() || null,
    }

    if (editingBeneficiary) {
      const { error } = await supabase
        .from('beneficiaries')
        .update({
          ...beneficiaryData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingBeneficiary.id)

      if (error) {
        console.error(error)
        setError('Unable to update the beneficiary.')
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('beneficiaries')
        .insert(beneficiaryData)

      if (error) {
        console.error(error)
        setError('Unable to create the beneficiary.')
        setSaving(false)
        return
      }
    }

    setSuccess(
  editingBeneficiary
    ? 'Beneficiary updated successfully.'
    : 'Beneficiary created successfully.'
)

await loadData()
closeForm()
setSaving(false)
  }

  async function handleDelete(beneficiary) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${beneficiary.full_name}"?`
    )

    if (!confirmed) return

    setError('')
    setSuccess('')

    const { error } = await supabase
      .from('beneficiaries')
      .delete()
      .eq('id', beneficiary.id)

    if (error) {
      console.error(error)
      setError('Unable to delete the beneficiary.')
      return
    }

    setSuccess('Beneficiary deleted successfully.')
    await loadData()
  }

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const searchTerm = search.toLowerCase()

    const matchesSearch =
      beneficiary.full_name
        .toLowerCase()
        .includes(searchTerm) ||
      (beneficiary.programs?.name || '')
        .toLowerCase()
        .includes(searchTerm)

    const matchesStatus =
      statusFilter === 'all' ||
      beneficiary.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const canManage =
    profile?.role === 'admin' ||
    profile?.role === 'program_coordinator'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Beneficiaries</h1>
          <p>
            Manage beneficiaries and their program assignments.
          </p>
        </div>

        {canManage && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Beneficiary
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

      <div className="page-toolbar beneficiaries-toolbar">
  <div className="beneficiary-filter-controls">
    <div className="search-field">
      <input
        type="search"
        aria-label="Search beneficiaries"
        placeholder="Search beneficiaries..."
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
      />
    </div>

    <select
      className="filter-select"
      aria-label="Filter beneficiaries by status"
      value={statusFilter}
      onChange={(event) =>
        setStatusFilter(event.target.value)
      }
    >
      <option value="all">
        All Statuses
      </option>

      <option value="active">
        Active
      </option>

      <option value="inactive">
        Inactive
      </option>

      <option value="completed">
        Completed
      </option>
    </select>
  </div>

  {!loading && (
    <span className="toolbar-count">
      {filteredBeneficiaries.length}{' '}
      {filteredBeneficiaries.length === 1
        ? 'beneficiary'
        : 'beneficiaries'}
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
      <strong>Loading beneficiaries</strong>
      <span>
        Please wait while we retrieve the latest records.
      </span>
    </div>
  </div>
) : filteredBeneficiaries.length === 0 ? (
  <div className="content-state">
    <div>
      <strong>
        {search || statusFilter !== 'all'
          ? 'No matching beneficiaries'
          : 'No beneficiaries yet'}
      </strong>

      <span>
        {search || statusFilter !== 'all'
          ? 'No beneficiaries match the current search or filter.'
          : canManage
            ? 'Add your first beneficiary to get started.'
            : 'There are currently no beneficiaries to display.'}
      </span>
    </div>

    {(search || statusFilter !== 'all') && (
      <button
        type="button"
        className="secondary-button"
        onClick={() => {
          setSearch('')
          setStatusFilter('all')
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
) : (
  <div className="table-container">
    <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Program</th>
                <th>Status</th>
                <th>Date Registered</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBeneficiaries.map((beneficiary) => (
                <tr key={beneficiary.id}>
                  <td className="beneficiary-name-cell">
  <strong>
    {beneficiary.full_name}
  </strong>
</td>

                  <td>
                    {beneficiary.programs?.name || '—'}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${beneficiary.status}`}
                    >
                      {beneficiary.status}
                    </span>
                  </td>

                  <td>
                    {beneficiary.date_registered
                      ? new Date(
                          `${beneficiary.date_registered}T00:00:00`
                        ).toLocaleDateString('en-PH')
                      : '—'}
                  </td>

                  <td className="beneficiary-notes-cell">
  {beneficiary.notes || '—'}
</td>

                  <td>
  <div className="action-buttons">
    {canManage && (
      <button
        type="button"
        className="table-button"
        onClick={() =>
          openEditForm(beneficiary)
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
          handleDelete(beneficiary)
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
                {editingBeneficiary
                  ? 'Edit Beneficiary'
                  : 'Add Beneficiary'}
              </h2>

              <button
  type="button"
  className="close-button"
  onClick={closeForm}
  aria-label="Close beneficiary form"
>
  ×
</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
  <label htmlFor="full_name">
    Full Name
  </label>

  <input
    id="full_name"
    name="full_name"
    type="text"
    value={formData.full_name}
    onChange={handleChange}
    placeholder="Enter beneficiary name"
    required
  />
</div>

<div className="form-group">
  <label htmlFor="program_id">
    Program
  </label>

  <select
    id="program_id"
    name="program_id"
    value={formData.program_id}
    onChange={handleChange}
  >
    <option value="">
      No Program Assigned
    </option>

    {programs
      .filter(
        (program) =>
          program.status === 'active' ||
          program.id === Number(formData.program_id)
      )
      .map((program) => (
        <option
          key={program.id}
          value={program.id}
        >
          {program.name}
        </option>
      ))}
  </select>
</div>

<div className="form-group">
  <label htmlFor="status">
    Status
  </label>

  <select
    id="status"
    name="status"
    value={formData.status}
    onChange={handleChange}
  >
    <option value="active">
      Active
    </option>

    <option value="inactive">
      Inactive
    </option>

    <option value="completed">
      Completed
    </option>
  </select>
</div>

<div className="form-group">
  <label htmlFor="date_registered">
    Date Registered
  </label>

  <input
    id="date_registered"
    name="date_registered"
    type="date"
    value={formData.date_registered}
    onChange={handleChange}
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
                    : editingBeneficiary
                      ? 'Save Changes'
                      : 'Create Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Beneficiaries