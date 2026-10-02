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
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your account and security settings.
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

      <div className="settings-grid">
        {/* ACCOUNT INFORMATION */}

        <div className="form-card">
  <div className="settings-card-header">
    <h2>My Account</h2>
    <p>
      Review your account information and update
      your display name.
    </p>
  </div>

          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
            <label htmlFor="settings_full_name">
              Full Name
            </label>

  <input
    id="settings_full_name"
    type="text"
    value={fullName}
    onChange={(event) =>
      setFullName(event.target.value)
    }
    required
  />
</div>

            <div className="form-group">
  <label htmlFor="settings_email">
    Email Address
  </label>

  <input
    id="settings_email"
    type="email"
    value={email}
    disabled
  />

  <span className="form-hint">
    Your email address is linked to your staff account
    and cannot be changed here.
  </span>
</div>

            <div className="form-group">
  <label htmlFor="settings_role">
    Role
  </label>

  <input
    id="settings_role"
    type="text"
    value={formatRole(profile?.role)}
    disabled
  />

  <span className="form-hint">
    Staff roles are managed by an administrator.
  </span>
</div>

            <div className="form-group">
  <label htmlFor="settings_created">
    Account Created
  </label>

  <input
    id="settings_created"
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
  <div className="settings-card-header">
    <h2>Security</h2>
    <p>
      Update the password used to access your
      staff account.
    </p>
  </div>

          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
  <label htmlFor="settings_new_password">
    New Password
  </label>

  <input
    id="settings_new_password"
    type="password"
    value={newPassword}
    onChange={(event) =>
      setNewPassword(event.target.value)
    }
    placeholder="Minimum 6 characters"
    minLength={6}
    autoComplete="new-password"
    required
  />

  <span className="form-hint">
    Use at least 6 characters.
  </span>
</div>

<div className="form-group">
  <label htmlFor="settings_confirm_password">
    Confirm New Password
  </label>

  <input
    id="settings_confirm_password"
    type="password"
    value={confirmPassword}
    onChange={(event) =>
      setConfirmPassword(event.target.value)
    }
    placeholder="Enter the new password again"
    minLength={6}
    autoComplete="new-password"
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

          <div className="settings-danger-zone">
  <div>
    <h3>Sign Out</h3>
    <p>
      End your current staff session on this device.
    </p>
  </div>

  <button
    type="button"
    className="table-button danger"
    onClick={handleSignOut}
  >
    Sign Out
  </button>
</div>
        </div>
      </div>
    </div>
  )
}

export default Settings