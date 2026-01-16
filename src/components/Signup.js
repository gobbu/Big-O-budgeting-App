import React, { useState } from 'react';
import './Signup.css'; // Import the CSS file for styling

const Signup = ({ setCurrentPage, onSignupSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    capital: false,
    lowercase: false,
    special: false,
    number: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false); // Track match status
  const [errorMessage, setErrorMessage] = useState('');


  const appUrl = process.env.REACT_APP_URL;

  // Password validation logic
  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /\d/.test(password),
    };
    setPasswordChecks(checks);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
    setPasswordsMatch(newPassword === confirmPassword); // Check match dynamically
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordsMatch(password === newConfirmPassword); // Check match dynamically
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setErrorMessage('Registration failed. Please try again.');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${appUrl}/backend/signup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();
      if (data.status === 'success') {
        alert('Signup successful!');

        // Set the username cookie (with a 1-hour expiration)
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000); // Add 1 hour (in milliseconds)
        document.cookie = `username=${username}; expires=${expirationDate.toUTCString()}; path=/`;

        onSignupSuccess(username); // Trigger on successful signup
      } else {
        // alert(data.message); // Display error message
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error signing up:', error);
    }
  };

  const backgroundUrl = `${appUrl}/build/images/login_screen_graphic.png`;

  return (
    <div className="signup-container">
      <div className="signup-form">
        <div className="create">
          <h2>Create an Account</h2>
        </div>
        <form onSubmit={handleSignup} className="form">
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Username: </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <ul className="password-requirements">
              <li className={passwordChecks.length ? 'met' : ''}>
                At least 8 characters
              </li>
              <li className={passwordChecks.capital ? 'met' : ''}>
                At least 1 capital letter
              </li>
              <li className={passwordChecks.lowercase ? 'met' : ''}>
                At least 1 lowercase letter
              </li>
              <li className={passwordChecks.special ? 'met' : ''}>
                At least 1 special character
              </li>
              <li className={passwordChecks.number ? 'met' : ''}>
                At least 1 number
              </li>
            </ul>
          </div>
          <div>
            <label>Confirm Password: </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
            <p
              className={`password-match-message ${
                passwordsMatch ? 'match' : 'no-match'
              }`}
            >
              {passwordsMatch
                ? 'Passwords match!'
                : 'Passwords do not match!'}
            </p>
          </div>
          <button type="submit">Register</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message if exists */}
          <button type="button" onClick={() => setCurrentPage('login')}>
            Go to Login
          </button>
        </form>
      </div>
      <div
        className="background"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      ></div>
    </div>
  );
};

export default Signup;