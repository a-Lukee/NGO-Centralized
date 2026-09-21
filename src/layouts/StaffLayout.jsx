import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseclient'

function StaffLayout({ profile }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="staff-layout">

      <aside className="sidebar">

        <div className="sidebar-brand">
          <h2>NGO Centralized</h2>
          <span>Staff Portal</span>
        </div>

        <nav>

          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/beneficiaries">
            Beneficiaries
          </NavLink>

          <NavLink to="/programs">
            Programs
          </NavLink>

          <div className="nav-section">
            Financial Management
          </div>

          <NavLink to="/donations">
            Donations
          </NavLink>

          <NavLink to="/sponsorships">
            Sponsorships
          </NavLink>

          <NavLink to="/expenses">
            Expenses
          </NavLink>

          <NavLink to="/announcements">
            Announcements
          </NavLink>

          {profile?.role === 'admin' && (
            <NavLink to="/users">
              Users
            </NavLink>
          )}

          <NavLink to="/settings">
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