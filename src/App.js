import React, { useState, useEffect, createContext, useContext } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import TaskPage from './components/TaskPage';
import Home from './components/Home';
import NotAuthenticated from './components/NotAuthenticated';
import Payments from './components/Payments';
import Calendar from './components/Calendar';
import WorkHours from './components/WorkHours';
import Budget from './components/Budget';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Rewards from './components/Rewards';
import AboutUs from './components/AboutUs';

import './App.css';

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

function App() {
  const [currentPage, setCurrentPage] = useState("login");  //default is login
  const [isAuthenticated, setIsAuthenticated] = useState(false);  //default is false
  const [authMessage, setAuthMessage] = useState("This page has not yet been made.");
  const [username, setUsername] = useState('');
  const [resetToken, setResetToken] = useState(null);

  // Check URL for token on initial load and navigate if found
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      sessionStorage.setItem('resetToken', token);  // Store token in sessionStorage
      setResetToken(token); // Update state with token
      setCurrentPage("resetPassword"); // Automatically go to reset password page
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setUsername(user);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("login");
  };

  const redirectToNotAuthenticated = (message) => {
    setAuthMessage(message);
    setCurrentPage("notAuthenticated");
  };

  let content;
  if (currentPage === "login") {
    content = (
      <Login
        setCurrentPage={setCurrentPage}
        onLoginSuccess={handleLoginSuccess}
        redirectToNotAuthenticated={redirectToNotAuthenticated}
      />
    );
  } else if (currentPage === "signup") {
    content = (
      <Signup
        setCurrentPage={setCurrentPage}
        onSignupSuccess={handleLoginSuccess}
        redirectToNotAuthenticated={redirectToNotAuthenticated}
      />
    );
  } else if (currentPage === "home") {
    content = isAuthenticated ? (
      <Home
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        username={username}
      />
    ) : (
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "tasks") {
    content = isAuthenticated ? (
      <TaskPage setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
    ) : (
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "payments") {
    content = isAuthenticated ? (
      <Payments setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
    ) : (
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "calendar") {
    content = isAuthenticated ? (
      <Calendar 
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout} 
      />
    ) : (
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "work hours") {
    content = isAuthenticated ? ( 
      <WorkHours
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      /> 
    ) : ( 
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} /> 
    );
  } else if (currentPage === "budget") { 
    content = isAuthenticated ? ( 
      <Budget 
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
      />
    ) : ( 
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "rewards") {
    content = isAuthenticated ? (
      <Rewards setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
    ) : (
      <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "forgotPassword") {
    content = (
      <ForgotPassword setCurrentPage={setCurrentPage} />
    );
  } else if (currentPage === "resetPassword" && resetToken) {
    content = <ResetPassword setCurrentPage={setCurrentPage} resetToken={resetToken} />;
  } else if (currentPage === "aboutUs"){
    content = <AboutUs setCurrentPage={setCurrentPage} />;
  }else {
    content = <NotAuthenticated message={authMessage} setCurrentPage={setCurrentPage} />;
  }

  const appClass = `${currentPage}-page`;

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <div className={`App ${appClass}`}>
        <div className="container">{content}</div>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
export { useAuth };
