import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { supabase } from './lib/supabaseClient'
import StaffLayout from './layouts/StaffLayout'

import Dashboard from './pages/Dashboard'
import Beneficiaries from './pages/Beneficiaries'
import Programs from './pages/Programs'
import Donations from './pages/Donations'
import Sponsorships from './pages/Sponsorships'
import Expenses from './pages/Expenses'
import Announcements from './pages/Announcements'
import Users from './pages/Users'
import Settings from './pages/Settings'

import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import About from './pages/About'
import PublicPrograms from './pages/PublicPrograms'
import Impact from './pages/Impact'
import PublicAnnouncements from './pages/PublicAnnouncements'
import Transparency from './pages/Transparency'
import Contact from './pages/Contact'

import './App.css'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    setError('')
    setLoading(true)

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    onLogin(data.user)
    setLoading(false)
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>NGO Centralized</h1>

        <p className="login-subtitle">
          Financial Stewardship & Public Engagement
        </p>

        <form onSubmit={handleSubmit}>

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

      </div>

    </div>
  )
}

function ProtectedRoutes({ profile, allowedRoles }) {
  if (!profile) {
    return <Navigate to="/login" replace />
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(profile.role)
  ) {
    return <Navigate to="/dashboard" replace />
  }

  return <StaffLayout profile={profile} />
}

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)

        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function initializeAuth() {
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
      console.error(error)
      setProfile(null)
      return
    }

    setProfile(data)
  }

  if (loading) {
    return (
      <div className="loading">
        Loading NGO Centralized...
      </div>
    )
  }

  return (
    <BrowserRouter basename="/NGO-Centralized">

      <Routes>

        <Route
          path="/login"
          element={
            session
              ? <Navigate to="/dashboard" replace />
              : (
                <Login
                  onLogin={(user) =>
                    loadProfile(user.id)
                  }
                />
              )
          }
        />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/public-programs"
            element={<PublicPrograms />}
          />
          <Route path="/impact" element={<Impact />} />

          <Route
            path="/public-announcements"
            element={<PublicAnnouncements />}
          />

          <Route
            path="/transparency"
            element={<Transparency />}
          />
          
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route
  element={
    <ProtectedRoutes
      profile={profile}
      allowedRoles={[
        'admin',
        'finance',
        'program_coordinator'
      ]}
    />
  }
>
  <Route
    path="/dashboard"
    element={<Dashboard profile={profile} />}
  />
</Route>

<Route
  element={
    <ProtectedRoutes
      profile={profile}
      allowedRoles={[
        'admin',
        'program_coordinator'
      ]}
    />
  }
>
  <Route
    path="/beneficiaries"
    element={<Beneficiaries profile={profile} />}
  />

  <Route
    path="/programs"
    element={<Programs profile={profile} />}
  />

  <Route
    path="/announcements"
    element={<Announcements profile={profile} />}
  />
</Route>

<Route
  element={
    <ProtectedRoutes
      profile={profile}
      allowedRoles={[
        'admin',
        'finance'
      ]}
    />
  }
>
  <Route
    path="/donations"
    element={<Donations profile={profile} />}
  />

  <Route
    path="/sponsorships"
    element={<Sponsorships profile={profile} />}
  />

  <Route
    path="/expenses"
    element={<Expenses profile={profile} />}
  />
</Route>

<Route
  element={
    <ProtectedRoutes
      profile={profile}
      allowedRoles={['admin']}
    />
  }
>
  <Route
    path="/users"
    element={<Users profile={profile} />}
  />
</Route>

<Route
  element={
    <ProtectedRoutes
      profile={profile}
      allowedRoles={[
        'admin',
        'finance',
        'program_coordinator'
      ]}
    />
  }
>
  <Route
    path="/settings"
    element={<Settings profile={profile} />}
  />
</Route>

        <Route
          path="*"
          element={
            <Navigate
              to={
                session
                  ? '/dashboard'
                  : '/login'
              }
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App