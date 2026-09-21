import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Programs({ profile }) {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPrograms()
  }, [])

  async function loadPrograms() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
      setError('Unable to load programs.')
      setLoading(false)
      return
    }

    setPrograms(data || [])
    setLoading(false)
  }

  function openAddForm() {
    setEditingProgram(null)

    setFormData({
      name: '',
      description: '',
      status: 'active',
    })

    setShowForm(true)
    setError('')
  }

  function openEditForm(program) {
    setEditingProgram(program)

    setFormData({
      name: program.name,
      description: program.description || '',
      status: program.status,
    })

    setShowForm(true)
    setError('')
  }

  function closeForm() {
    setShowForm(false)
    setEditingProgram(null)

    setFormData({
      name: '',
      description: '',
      status: 'active',
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

    if (!formData.name.trim()) {
      setError('Program name is required.')
      return
    }

    setSaving(true)
    setError('')

    if (editingProgram) {
      const { error } = await supabase
        .from('programs')
        .update({
          name: formData.name.trim(),
          description:
            formData.description.trim() || null,
          status: formData.status,
        })
        .eq('id', editingProgram.id)

      if (error) {
        console.error(error)
        setError(
          'Unable to update the program.'
        )
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('programs')
        .insert({
          name: formData.name.trim(),
          description:
            formData.description.trim() || null,
          status: formData.status,
        })

      if (error) {
        console.error(error)
        setError(
          'Unable to create the program.'
        )
        setSaving(false)
        return
      }
    }

    await loadPrograms()
    closeForm()
    setSaving(false)
  }

  async function handleDelete(program) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${program.name}"?`
    )

    if (!confirmed) {
      return
    }

    setError('')

    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('id', program.id)

    if (error) {
      console.error(error)
      setError(
        'Unable to delete the program. It may be referenced by other records.'
      )
      return
    }

    await loadPrograms()
  }

  const filteredPrograms = programs.filter(
    (program) => {
      const matchesSearch =
        program.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (program.description || '')
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === 'all' ||
        program.status === statusFilter

      return matchesSearch && matchesStatus
    }
  )

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h1>Programs</h1>

          <p>
            Manage the organization's programs
            and activities.
          </p>
        </div>

        {(profile?.role === 'admin' ||
          profile?.role === 'program_coordinator') && (
          <button
            className="primary-button"
            onClick={openAddForm}
          >
            + Add Program
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
          placeholder="Search programs..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
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
        </select>

      </div>

      <div className="table-container">

        {loading ? (
          <p className="empty-state">
            Loading programs...
          </p>
        ) : filteredPrograms.length === 0 ? (
          <p className="empty-state">
            No programs found.
          </p>
        ) : (
          <table>

            <thead>
              <tr>
                <th>Program Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredPrograms.map(
                (program) => (
                  <tr key={program.id}>

                    <td>
                      <strong>
                        {program.name}
                      </strong>
                    </td>

                    <td>
                      {program.description ||
                        '—'}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${program.status}`}
                      >
                        {program.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        program.created_at
                      ).toLocaleDateString(
                        'en-PH'
                      )}
                    </td>

                    <td>

                      {(profile?.role ===
                        'admin' ||
                        profile?.role ===
                          'program_coordinator') && (
                        <button
                          className="table-button"
                          onClick={() =>
                            openEditForm(
                              program
                            )
                          }
                        >
                          Edit
                        </button>
                      )}

                      {profile?.role ===
                        'admin' && (
                        <button
                          className="table-button danger"
                          onClick={() =>
                            handleDelete(
                              program
                            )
                          }
                        >
                          Delete
                        </button>
                      )}

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>
        )}

      </div>

      {showForm && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingProgram
                  ? 'Edit Program'
                  : 'Add Program'}
              </h2>

              <button
                className="close-button"
                onClick={closeForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <label htmlFor="name">
                Program Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter program name"
                required
              />

              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the program"
                rows="5"
              />

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
              </select>

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
                    : editingProgram
                      ? 'Save Changes'
                      : 'Create Program'}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  )
}

export default Programs