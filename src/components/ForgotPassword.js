import React, { useState, useEffect } from 'react';
import './ForgotPassword.css';

const ForgotPassword = ({ setCurrentPage }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Effect to check for a token in the URL and transition to reset password if found
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // If token exists in URL, store it and move to reset password page
      sessionStorage.setItem('resetToken', token); // Store token for use in reset password
      setCurrentPage('resetPassword'); // Go directly to reset password page
    }
  }, [setCurrentPage]);

  const handleRequest = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_URL}/backend/forgot_password.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`,
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);  // Display the backend's response message
      });
  };

   // Function to handle going back to the homepage
   const handleBackToHome = () => {
    setCurrentPage('login'); // Set the current page to 'home' (or any other name for the homepage)
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-form">
        <h2 className="title">Forgot Password</h2>
        <form onSubmit={handleRequest} className="form">
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Enter your username" 
            required 
          />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="Enter your email" 
            required 
          />
          <button type="submit">Submit</button>
          <button onClick={handleBackToHome} className="back-to-login">Back to Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      <div className="background"></div>
    </div>
  );
};

export default ForgotPassword;
