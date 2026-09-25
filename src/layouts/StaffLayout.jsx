import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

function StaffLayout({ profile }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  async function handleLogout() {
    setSidebarOpen(false)
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isAdmin = profile?.role === 'admin'
  const isFinance = profile?.role === 'finance'
  const isProgramCoordinator =
    profile?.role === 'program_coordinator'

  return (
    <div className="staff-layout">
      <header className="mobile-staff-header">
        <div>
          <strong>NGO Centralized</strong>
          <span>Staff Portal</span>
        </div>

      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
        aria-expanded={sidebarOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>

    {sidebarOpen && (
      <button
        type="button"
        className="sidebar-backdrop"
        onClick={closeSidebar}
        aria-label="Close navigation"
      />
    )}

      <aside
        className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}
      >

        <div className="sidebar-brand">
          <div>
            <h2>NGO Centralized</h2>
            <span>Staff Portal</span>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>

        <nav>

          <NavLink to="/dashboard" onClick={closeSidebar}>
            Dashboard
          </NavLink>

          {(isAdmin || isProgramCoordinator) && (
            <>
              <NavLink to="/beneficiaries" onClick={closeSidebar}>
                Beneficiaries
              </NavLink>

              <NavLink to="/programs" onClick={closeSidebar}>
                Programs
              </NavLink>
            </>
          )}

          {(isAdmin || isFinance) && (
            <>
              <div className="nav-section">
                Financial Management
              </div>

              <NavLink to="/donations" onClick={closeSidebar}>
                Donations
              </NavLink>

              <NavLink to="/sponsorships" onClick={closeSidebar}>
                Sponsorships
              </NavLink>

              <NavLink to="/expenses" onClick={closeSidebar}>
                Expenses
              </NavLink>
            </>
          )}

          {(isAdmin || isProgramCoordinator) && (
            <NavLink to="/announcements" onClick={closeSidebar}>
              Announcements
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/users" onClick={closeSidebar}>
              Users
            </NavLink>
          )}

          <NavLink to="/settings" onClick={closeSidebar}>
            Settings
          </NavLink>

        </nav>

        <div className="sidebar-footer">

          <div className="user-info">
            <strong>
              {profile?.full_name}
            </strong>

            <span>
              {profile?.role}
            </span>
          </div>

          <button onClick={handleLogout}>
            Sign Out
          </button>

        </div>

      </aside>

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  )
}

export default StaffLayout