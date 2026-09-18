import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  useEffect(() => {
    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (!session) {
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function checkSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    setSession(session)

    if (session?.user) {
      await loadProfile(session.user.id)
    }

    setLoading(false)
  }

  async function loadProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Profile error:', error)
      setError('Could not load your user profile.')
      return
    }

    setProfile(data)
  }

  async function handleLogin(event) {
    event.preventDefault()

    setError('')
    setLoggingIn(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoggingIn(false)
      return
    }

    if (data.user) {
      await loadProfile(data.user.id)
    }

    setLoggingIn(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
  }

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          Loading NGO Centralized...
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>NGO Centralized</h1>

          <p className="login-subtitle">
            Financial Stewardship & Public Engagement
          </p>

          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button type="submit" disabled={loggingIn}>
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>NGO Centralized</h1>
          <p>Staff Portal</p>
        </div>

        <button onClick={handleLogout}>
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <h2>Welcome, {profile?.full_name || 'User'}!</h2>

        <div className="profile-card">
          <p>
            <strong>Role:</strong>{' '}
            {profile?.role || 'Unknown'}
          </p>

          <p>
            <strong>Email:</strong>{' '}
            {session.user.email}
          </p>
        </div>

        <div className="coming-soon">
          <h3>Dashboard Coming Next</h3>
          <p>
            Your role-based NGO management dashboard will
            be built here.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App