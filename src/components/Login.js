import React, { useState } from 'react';
import './Login.css'; // Import the CSS file for styling

const Login = ({ setCurrentPage, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const appUrl = process.env.REACT_APP_URL;

  const handleLogin = () => {

    

    fetch(`${appUrl}/backend/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          //removed alert if success to login -- 11/20/24
          //alert('Successfully logged in!'); 

          // Set the username cookie (with a 1-hour expiration)
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + (60 * 60 * 1000)); // Add 1 hour
          document.cookie = `username=${username}; expires=${expirationDate.toUTCString()}; path=/`;


          onLoginSuccess(); // Call the success handler to navigate to the home page
        } else {
          // alert(data.message); // Show error message if login failed
          setErrorMessage(data.message);
        }
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        // alert('Login failed. Please try again.');
        setErrorMessage('Login failed. Please try again.'); // Set error message if there's an error
      });
  };

  // Use backticks for template literals
  const backgroundUrl = `${appUrl}/build/images/login_screen_graphic.png`;
  const budgetIconUrl = `${appUrl}/build/images/budget_icon.png`;

  return (
    <div className="login-container">
    {/* navigation bar
    <div className='nav-bar'> 
      <button className='nav-button' onClick={() => setCurrentPage('aboutUs')}>
        About Us
      </button>
    </div> */}
    {/* Login Form section*/}
      <div className='login-form'>
        <div className='logging-in'>
          <h2>Login</h2>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="form">
          <div>
            <label>Username: </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Username" 
              required 
            />
          </div>
          <div>
            <label>Password: </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Password" 
              required 
            />
          </div>
          <button type="submit">Login</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>} {/* Display error message if exists */}
          <button type="button" onClick={() => setCurrentPage('signup')}>Go to Signup</button>
          <button type="button" onClick={() => setCurrentPage('forgotPassword')}>Forgot Password?</button>
        </form>
      </div>

      {/* Background container */}
      <div className="background" style={{ backgroundImage: `url(${backgroundUrl})` }}></div>
      {/* Navigation bar with About Us button */}
      <div className="nav-bar">
        <button className="nav-button" onClick={() => setCurrentPage('aboutUs')}>
          About Us
        </button>
      </div>
    

      {/* Optional budget icon */}
      <div className="budget-icon">
      <img src={budgetIconUrl} alt="Budget Icon" />
      </div>
    </div>
  );
};

export default Login;