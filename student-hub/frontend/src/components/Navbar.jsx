import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">Student Hub</Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/planner">Planner</Link>
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn-link" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-primary-small">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
