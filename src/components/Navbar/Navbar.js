import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/authSlice';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(s => s.auth);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">Hire<span>Now</span></Link>

        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Browse Jobs</Link>
          {user && !isEmployer && <Link to="/applications" className={isActive('/applications')}>My Applications</Link>}
          {isEmployer && <Link to="/my-jobs" className={isActive('/my-jobs')}>My Postings</Link>}
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              {isEmployer && <Link to="/post-job" className="btn btn-teal btn-sm">+ Post a Job</Link>}
              <div className="nav-user">
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
