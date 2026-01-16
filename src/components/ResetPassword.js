import React, { useState } from 'react';
import './ResetPassword.css';

const ResetPassword = ({ setCurrentPage }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const resetToken = sessionStorage.getItem('resetToken');  // Retrieve token from session storage

  const handleReset = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_URL}/backend/reset_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `token=${encodeURIComponent(resetToken)}&new_password=${encodeURIComponent(newPassword)}&confirm_password=${encodeURIComponent(confirmPassword)}`,
    })
    .then((response) => response.json())
    .then((data) => {
        setMessage(data.message);
        if (data.status === 'success') {
          setTimeout(() => {
            sessionStorage.removeItem('resetToken');  // Clear the token after reset
            setCurrentPage('login');
          }, 2000);
        }
      });
  };

  // Navigate to homepage directly
  const handleGoToHomepage = () => {
    sessionStorage.removeItem('resetToken'); // Clear the reset token if they decide not to reset the password
    setCurrentPage('home'); // Navigate to the homepage
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <h2 className="title">Reset Password</h2>
        <form onSubmit={handleReset} className="form">
          <input 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
            placeholder="Enter new password" 
            required 
          />
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="Confirm new password" 
            required 
          />
          <button type="submit">Reset Password</button>
        </form>
        {message && <p>{message}</p>}

        {/* Button to Go Back to Homepage */}
        <button onClick={handleGoToHomepage} className="go-home-button">
          Go to Homepage
        </button>

        {/* Button to Go Back to Login Page */}
        <button onClick={() => setCurrentPage('login')} className="go-back-button">
          Go Back To Login
        </button>
        
      </div>
      <div className="background"></div>
    </div>
  );
};

export default ResetPassword;
