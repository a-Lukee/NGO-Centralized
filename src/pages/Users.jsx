import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Users({ profile }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  const [showCreateForm, setShowCreateForm] = useState(false)

  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'program_coordinator'
  })

  async function callUserManagement(action, data = {}) {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('Your session has expired. Please log in again.')
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-user-management`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action,
          ...data
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Something went wrong')
    }

    return result
  }

  async function loadUsers() {
    setLoading(true)
    setError('')

    try {
      const result = await callUserManagement('list')
      setUsers(result.users || [])
    } catch (err) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadUsers()
    } else {
      setLoading(false)
    }
  }, [profile])

  async function handleCreateUser(event) {
    event.preventDefault()

    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await callUserManagement('create', {
        full_name: newUser.full_name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role
      })

      setSuccess('User created successfully.')

      setNewUser({
        full_name: '',
        email: '',
        password: '',
        role: 'program_coordinator'
      })

      setShowCreateForm(false)

      await loadUsers()
    } catch (err) {
  console.error(err)
  setError(err.message)
} finally {
  setSaving(false)
}
  }

  async function handleRoleChange(userId, newRole) {
  setError('')
  setSuccess('')
  setSaving(true)

  try {
    await callUserManagement('update_role', {
      user_id: userId,
      role: newRole
    })

    setSuccess('User role updated successfully.')

    await loadUsers()
  } catch (err) {
    console.error(err)
    setError(err.message)
  } finally {
    setSaving(false)
  }
}

  async function handleDelete(userId, userName) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${userName}'s account? This action cannot be undone.`
  )

  if (!confirmed) {
    return
  }

  setError('')
  setSuccess('')
  setSaving(true)

  try {
    await callUserManagement('delete', {
      user_id: userId
    })

    setSuccess('User deleted successfully.')

    await loadUsers()
  } catch (err) {
    console.error(err)
    setError(err.message)
  } finally {
    setSaving(false)
  }
}

  if (profile?.role !== 'admin') {
  return (
    <div className="page">
      <div className="content-state">
        <div>
          <strong>Access restricted</strong>
          <span>
            You do not have permission to manage staff accounts.
          </span>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage staff accounts and system roles.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            setError('')
            setSuccess('')
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Add User'}
        </button>
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

      {showCreateForm && (
        <div className="form-card">
          <h2>Create Staff Account</h2>

          <form onSubmit={handleCreateUser}>
            <div className="form-grid">
              <div className="form-group">
  <label htmlFor="staff_full_name">
    Full Name
  </label>

  <input
    id="staff_full_name"
    type="text"
    value={newUser.full_name}
    onChange={(event) =>
      setNewUser({
        ...newUser,
        full_name: event.target.value
      })
    }
    placeholder="Enter staff member's full name"
    required
  />
</div>

              <div className="form-group">
  <label htmlFor="staff_email">
    Email Address
  </label>

  <input
    id="staff_email"
    type="email"
    value={newUser.email}
    onChange={(event) =>
      setNewUser({
        ...newUser,
        email: event.target.value
      })
    }
    placeholder="name@example.com"
    required
  />
</div>

              <div className="form-group">
  <label htmlFor="staff_password">
    Temporary Password
  </label>

  <input
    id="staff_password"
    type="password"
    value={newUser.password}
    onChange={(event) =>
      setNewUser({
        ...newUser,
        password: event.target.value
      })
    }
    placeholder="Minimum 6 characters"
    minLength={6}
    required
  />

  <span className="form-hint">
    The staff member can use this password for their initial login.
  </span>
</div>

              <div className="form-group">
  <label htmlFor="staff_role">
    Role
  </label>

  <select
    id="staff_role"
    value={newUser.role}
    onChange={(event) =>
      setNewUser({
        ...newUser,
        role: event.target.value
      })
    }
  >
    <option value="program_coordinator">
      Program Coordinator
    </option>
    <option value="finance">
      Finance
    </option>
    <option value="admin">
      Admin
    </option>
  </select>
</div>
            </div>

            <button
  type="submit"
  className="primary-button"
  disabled={saving}
>
  {saving ? 'Creating...' : 'Create User'}
</button>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <h2>Staff Accounts</h2>

          <button
            className="secondary-button"
            onClick={loadUsers}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
  <div
    className="content-state"
    role="status"
  >
    <div className="loading-spinner"></div>

    <div>
      <strong>Loading staff accounts</strong>
      <span>
        Please wait while we retrieve the latest user information.
      </span>
    </div>
  </div>
) : users.length === 0 ? (
  <div className="content-state">
    <div>
      <strong>No staff accounts found</strong>
      <span>
        Create a staff account to get started.
      </span>
    </div>
  </div>
) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name-cell">
  <strong>{user.full_name}</strong>

  {user.id === profile.id && (
    <span className="current-user-badge">
      You
    </span>
  )}
</td>

                    <td className="user-email-cell">
  {user.email}
</td>

                    <td>
                      <select
                        value={user.role}
                        className="filter-select user-role-select"
                        aria-label={`Role for ${user.full_name}`}
                        onChange={(event) =>
                          handleRoleChange(
                            user.id,
                            event.target.value
                          )
                        }
                        disabled={
                          user.id === profile.id ||
                          saving
                        }
                      >
                        <option value="admin">
                          Admin
                        </option>

                        <option value="finance">
                          Finance
                        </option>

                        <option value="program_coordinator">
                          Program Coordinator
                        </option>
                      </select>
                    </td>

                    <td>
                      {new Date(
                        user.created_at
                      ).toLocaleDateString('en-PH')}
                    </td>

                    <td>
  {user.id === profile.id ? (
    <span className="muted-text">
      Current account
    </span>
  ) : (
    <div className="action-buttons">
      <button
        type="button"
        className="table-button danger"
        disabled={saving}
        onClick={() =>
          handleDelete(
            user.id,
            user.full_name
          )
        }
      >
        Delete
      </button>
    </div>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users