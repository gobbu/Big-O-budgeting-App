import React from 'react';
import './NotAuthenticated.css'; // Import styles for this component

const NotAuthenticated = ({ message, setCurrentPage }) => {
  return (
    <div className="auth-message-container">
      <div className="auth-message-box">
        <h2>Access Denied</h2>
        <p>{message}</p>
        <button onClick={() => setCurrentPage('home')} className="login-link">
          {/* Go to Login Page */}
          Go Back To Homepage
        </button>
      </div>
    </div>
  );
};

export default NotAuthenticated;