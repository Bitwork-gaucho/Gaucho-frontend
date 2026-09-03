import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Header.css'

interface HeaderProps {
  onLogout?: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const { session } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          !(e.target as HTMLElement).closest('.hamburger')) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    if (onLogout) {
      await onLogout()
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Gaucho" style={{ height: '40px', width: 'auto' }} />
        </Link>

        <div className="header-right">
          {session && <span className="user-email">{session.email.split('@')[0]}</span>}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span />
            <span />
            <span />
          </button>

          {menuOpen && (
            <div ref={menuRef} className="dropdown-menu">
              <Link to="/batches" onClick={() => setMenuOpen(false)}>Batches</Link>
              {session?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              {session ? (
                <button onClick={handleLogout} className="menu-logout">Log out</button>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
