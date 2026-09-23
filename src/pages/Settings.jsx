import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function Settings({ profile }) {
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')

  const [fullName, setFullName] = useState(
    profile?.full_name || ''
  )

  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || '')
        setCreatedAt(user.created_at || '')
      }
    }

    loadAccount()
  }, [])

  async function handleProfileUpdate(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Full name cannot be empty.')
      return
    }

    setSavingProfile(true)

    try {
      const { error: profileError } =
        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim()
          })
          .eq('id', profile.id)

      if (profileError) {
        throw profileError
      }

      setSuccess(
        'Your profile has been updated successfully.'
      )
    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Failed to update profile.'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError(
        'New password and confirmation password do not match.'
      )
      return
    }

    setChangingPassword(true)

    try {
      const { error: passwordError } =
        await supabase.auth.updateUser({
          password: newPassword
        })

      if (passwordError) {
        throw passwordError
      }

      setNewPassword('')
      setConfirmPassword('')

      setSuccess(
        'Your password has been changed successfully.'
      )
    } catch (err) {
      console.error(err)
      setError(
        err.message || 'Failed to change password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSignOut() {
    setError('')
    setSuccess('')

    const { error: signOutError } =
      await supabase.auth.signOut()

    if (signOutError) {
      setError(signOutError.message)
    }
  }

  function formatRole(role) {
    if (role === 'program_coordinator') {
      return 'Program Coordinator'
    }

    if (role === 'finance') {
      return 'Finance'
    }

    if (role === 'admin') {
      return 'Admin'
    }

    return role
  }

  function formatDate(date) {
    if (!date) {
      return '—'
    }

    return new Date(date).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your account and security settings.
          </p>
        </div>
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

      <div className="settings-grid">
        {/* ACCOUNT INFORMATION */}

        <div className="form-card">
          <h2>My Account</h2>

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={email}
                disabled
              />

              <small>
                Email address is managed by
                Supabase Authentication.
              </small>
            </div>

            <div className="form-group">
              <label>Role</label>

              <input
                type="text"
                value={formatRole(profile?.role)}
                disabled
              />
            </div>

            <div className="form-group">
              <label>Account Created</label>

              <input
                type="text"
                value={formatDate(createdAt)}
                disabled
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={savingProfile}
            >
              {savingProfile
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* SECURITY */}

        <div className="form-card">
          <h2>Security</h2>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                minLength={6}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={changingPassword}
            >
              {changingPassword
                ? 'Changing Password...'
                : 'Change Password'}
            </button>
          </form>

          <hr />

          <h3>Sign Out</h3>

          <p>
            Sign out of your current staff account.
          </p>

          <button
            type="button"
            className="danger-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings