import React, { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { UserContext } from '../Context/userContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useContext(UserContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize roles for comparison (case-insensitive)
  const userRole = user.role ? user.role.toLowerCase() : '';
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

  // If user role not in allowedRoles, redirect to login
  if (!normalizedAllowedRoles.includes(userRole)) {
    console.warn(`Access denied: User role "${userRole}" not in allowed roles [${allowedRoles.join(', ')}]`);
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has proper role
  return <Outlet />;
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0a',
    color: '#ffffff',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '1rem',
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

// Add keyframes for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.querySelector('style[data-private-route-styles]')) {
    style.setAttribute('data-private-route-styles', 'true');
    document.head.appendChild(style);
  }
}

export default PrivateRoute