import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, LayoutDashboard, LogOut, LogIn, Menu, X, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          <div className="navbar__logo">
            <Cpu size={18} strokeWidth={1.5} />
          </div>
          <span className="navbar__name">CodeScope</span>
          <span className="navbar__tag">AI</span>
        </Link>

        <div className="navbar__links">
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>
            Analyzer
          </Link>
          {user && (
            <Link to="/dashboard" className={`navbar__link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <div className="navbar__user">
                <div className="navbar__avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar__username">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="navbar__btn navbar__btn--ghost">
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                <LogIn size={14} />
                <span>Sign in</span>
              </Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="navbar__mobile">
          <Link to="/" className="navbar__mobile-link">Analyzer</Link>
          {user && <Link to="/dashboard" className="navbar__mobile-link">Dashboard</Link>}
          {user ? (
            <button onClick={handleLogout} className="navbar__mobile-link navbar__mobile-link--danger">Sign Out</button>
          ) : (
            <>
              <Link to="/login" className="navbar__mobile-link">Sign In</Link>
              <Link to="/register" className="navbar__mobile-link navbar__mobile-link--accent">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
