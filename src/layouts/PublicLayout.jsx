import { NavLink, Outlet } from 'react-router-dom'

function PublicLayout() {
  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-inner">
          <NavLink to="/" className="public-logo">
            NGO Centralized
          </NavLink>

          <nav className="public-nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/public-programs">Programs</NavLink>
            <NavLink to="/impact">Impact</NavLink>
            <NavLink to="/public-announcements">
              Announcements
            </NavLink>
            <NavLink to="/transparency">
              Financial Transparency
            </NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <NavLink
            to="/login"
            className="staff-login-link"
          >
            Staff Login
          </NavLink>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div>
          <strong>NGO Centralized</strong>
          <p>
            Centralized information and public engagement platform.
          </p>
        </div>

        <div>
          <p>© 2026 NGO Centralized</p>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout