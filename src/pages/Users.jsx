import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Users({ profile }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    }
  }

  async function handleRoleChange(userId, newRole) {
    setError('')
    setSuccess('')

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

    try {
      await callUserManagement('delete', {
        user_id: userId
      })

      setSuccess('User deleted successfully.')

      await loadUsers()
    } catch (err) {
      console.error(err)
      setError(err.message)
    }
  }

  if (profile?.role !== 'admin') {
    return (
      <div>
        <h1>Users</h1>
        <p>You do not have permission to manage users.</p>
      </div>
    )
  }

  return (
    <div>
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

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {showCreateForm && (
        <div className="form-card">
          <h2>Create Staff Account</h2>

          <form onSubmit={handleCreateUser}>
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  value={newUser.full_name}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      full_name: event.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  value={newUser.email}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      email: event.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Temporary Password</label>

                <input
                  type="password"
                  value={newUser.password}
                  onChange={(event) =>
                    setNewUser({
                      ...newUser,
                      password: event.target.value
                    })
                  }
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <select
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
            >
              Create User
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
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No staff accounts found.</p>
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
                    <td>{user.full_name}</td>

                    <td>{user.email}</td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(
                            user.id,
                            event.target.value
                          )
                        }
                        disabled={user.id === profile.id}
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
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      {user.id === profile.id ? (
                        <span className="muted-text">
                          Current account
                        </span>
                      ) : (
                        <button
                          className="danger-button"
                          onClick={() =>
                            handleDelete(
                              user.id,
                              user.full_name
                            )
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
          </div>
        )}
      </div>
    </div>
  )
}

export default Users