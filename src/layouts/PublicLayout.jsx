import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'

function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
      setMenuOpen(false)
  }
  return (
    <div className="public-layout">
      <header className="public-header">
  <div className="public-header-inner">
    <NavLink
      to="/"
      className="public-logo"
      onClick={closeMenu}
    >
      NGO Centralized
    </NavLink>

    <button
      type="button"
      className="public-menu-button"
      onClick={() => setMenuOpen((open) => !open)}
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav
      className={`public-nav ${
        menuOpen ? 'public-nav-open' : ''
      }`}
    >
      <NavLink to="/" onClick={closeMenu}>
        Home
      </NavLink>

      <NavLink to="/about" onClick={closeMenu}>
        About Us
      </NavLink>

      <NavLink
        to="/public-programs"
        onClick={closeMenu}
      >
        Programs
      </NavLink>

      <NavLink to="/impact" onClick={closeMenu}>
        Impact
      </NavLink>

      <NavLink
        to="/public-announcements"
        onClick={closeMenu}
      >
        Announcements
      </NavLink>

      <NavLink
        to="/transparency"
        onClick={closeMenu}
      >
        Financial Transparency
      </NavLink>

      <NavLink to="/contact" onClick={closeMenu}>
        Contact
      </NavLink>

      <NavLink
        to="/login"
        className="mobile-staff-login-link"
        onClick={closeMenu}
      >
        Staff Login
      </NavLink>
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