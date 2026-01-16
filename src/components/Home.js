// import React from 'react';
import './Homepage.css'; // Import the CSS for styling
import Navbar from './Navbar';
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar'; // import the calendar component
import 'react-calendar/dist/Calendar.css'; // import the default styles for the calendar component 
import BudgetPieChart from './BudgetPieChart';


const Home = ({ setCurrentPage, handleLogout }) => {
  // Handle Logout
  const appUrl = process.env.REACT_APP_URL;

  const [username, setUsername] = useState('');

  const [notifications, setNotifications] = useState([]); // For storing notifications
  const [showNotifications, setShowNotifications] = useState(false); // For toggling notifications dropdown
  const [notificationCount, setNotificationCount] = useState(0); // State to track unread notifications

  const [transactions, setTransactions] = useState([]);
  const [date,setDate] = useState(new Date()); // state to store selected date 
  const [tasks, setTasks] = useState([]); //state for tasks 
  const [currentMonthData, setCurrentMonthData] = useState({ totalBudget: 0, totalSpent: 0 });
  const [lastMonthData, setLastMonthData] = useState({ totalBudget: 0, totalSpent: 0 });

  const remainingBalance = currentMonthData.totalBudget - currentMonthData.totalSpent //var to calcualte how much left 

  // Helper function to format the date to SQL datetime format
  const formatSQLDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00`;
  };

  // Fetch the budgets for both current month and last month
  useEffect(() => {
    const fetchBudgets = async () => {
      const today = new Date();
      
      // Current Month
      const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfCurrentMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      // console.log(startOfCurrentMonth, "current month start");
      
      // Last Month
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      // console.log(startOfLastMonth, "last month start");

      try {
        // Fetch current month data
        let currentMonthUrl = `${appUrl}/backend/add_budget.php?period=monthly`;
        currentMonthUrl += `&start_date=${formatSQLDate(startOfCurrentMonth)}&end_date=${formatSQLDate(endOfCurrentMonth)}`;
        
        const currentMonthResponse = await fetch(currentMonthUrl, {
          method: 'GET',
          credentials: 'include',
        });
        const currentMonthData = await currentMonthResponse.json();

        if (currentMonthData.status === 'success') {
          const budgets = currentMonthData.budgets;
          let totalBudget = 0;
          let totalSpent = 0;

          for (let category in budgets) {
            totalBudget += parseFloat(budgets[category].limit);
            totalSpent += parseFloat(budgets[category].spent);
          }

          setCurrentMonthData({ totalBudget, totalSpent });
          // console.log(currentMonthData, " curr month data")
        } else {
          console.error('Failed to fetch current month budget data:', currentMonthData.message);
        }

        // Fetch last month data
        let lastMonthUrl = `${appUrl}/backend/add_budget.php?period=monthly`;
        lastMonthUrl += `&start_date=${formatSQLDate(startOfLastMonth)}&end_date=${formatSQLDate(endOfLastMonth)}`;

        const lastMonthResponse = await fetch(lastMonthUrl, {
          method: 'GET',
          credentials: 'include',
        });
        const lastMonthData = await lastMonthResponse.json();

        if (lastMonthData.status === 'success') {
          const budgets = lastMonthData.budgets;
          let totalBudget = 0;
          let totalSpent = 0;

          for (let category in budgets) {
            totalBudget += parseFloat(budgets[category].limit);
            totalSpent += parseFloat(budgets[category].spent);
          }

          setLastMonthData({ totalBudget, totalSpent });
          // console.log(lastMonthData, " last month data")
        } else {
          console.error('Failed to fetch last month budget data:', lastMonthData.message);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      }
    };

    fetchBudgets();
  }, [appUrl]);

    // Fetch the latest transactions when the component loads
  useEffect(() => {
    fetch(`${appUrl}/backend/fetch_transactions.php`, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          setTransactions(data.transactions);
        } else {
          console.error('Failed to fetch transactions:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }, []);



  // fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${appUrl}/backend/task_page.php`, {
          method: 'GET',
          credentials: 'include', // This ensures the session cookies are included
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedTasks = data
            .filter(task => !task.task_complete)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 3);
          setTasks(sortedTasks);
        } else {
          console.error('Unexpected response format:', data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, [appUrl]);



  // Function to get a cookie value by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // Use useEffect to set the username from the cookie
  useEffect(() => {
    const cookieUsername = getCookie('username'); // Get username from cookie
    if (cookieUsername) {
      setUsername(cookieUsername); // Set the username if found
    } else {
      console.error('Username cookie not found.');
    }
  }, []); // Empty dependency array to run only once


  const logout = () => {
    fetch(`${appUrl}/backend/logout.php`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 'success') {
          handleLogout(); // Update the auth state and navigate to the login page
        } else {
          alert('Failed to log out.');
        }
      })
      .catch((error) => {
        console.error('Error logging out:', error);
      });
  };


  // Fetch notifications from the backend
  useEffect(() => {
    const fetchNotifications = async () => {
      const cookieUsername = getCookie('username'); // Get username from cookie
      if (cookieUsername) {
        try {
          const response = await fetch(`${appUrl}/backend/fetch_notifications.php?username=${cookieUsername}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();

          // Assuming data is an array of objects
          console.log('Fetched notifications:', data); // Log the response data
          setNotifications(data); // Set the notifications state
        } catch (error) {
          console.error('Error fetching notifications:', error); // Log any fetch errors
        }
      } else {
        console.error('Username cookie not found.');
      }
    };

    fetchNotifications(); // Call the function to fetch notifications
  }, []); // Fetch notifications when the component mounts

  useEffect(() => {
    const unreadCount = notifications.filter(notification => !notification.read).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  

  const toggleReadStatus = async (id, currentReadStatus) => {
    const newReadStatus = !currentReadStatus; // Toggle the read status
    try {
      const response = await fetch(`${appUrl}/backend/update_notifications.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, read: newReadStatus })
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      // Update the local notifications state
      setNotifications(prevNotifications => {
        return prevNotifications.map(notification => {
          if (notification.id === id) {
            return { ...notification, read: newReadStatus };
          }
          return notification;
        });
      });
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };


  // Navigate to the specified page
  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="homepage-container">
      {/* Sidebar */}
      <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

      {/* Top Bar */}
      <div className="top-bar">
        <input type="text" className="search-bar" placeholder="Search..." />
        
        <div className="top-icons">
          {/* Notifications Button */}
          <button className="icon-button" onClick={toggleNotifications}>
            <img className="icon" src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/notifications_icon.png" alt="Notification" />
            {notifications.length > 0 && (
              <span className="notification-count">{notificationCount}</span>
            )}
          </button>

          {/* User Profile Button */}
          <button className="icon-button">
            <img className="icon" src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/user_icon.png" alt="User Profile" />
            <span>User Profile</span>
          </button>
        </div>

      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
      <div className={`notification-dropdown ${showNotifications ? 'show' : ''}`}>
          {notifications.length > 0 ? (
              notifications.map((notification) => (
                  <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`} 
                      onClick={() => toggleReadStatus(notification.id, notification.read)} // Use notification.id
                  >
                      {notification.text} {/* Display the notification text */}
                  </div>
              ))
          ) : (
              <div>No new notifications</div>
          )}
      </div>
)}


      {/* Main Content */}
      <div className="main-content">
        <h1 className="welcome-header">Welcome Home, {username || 'User'}</h1> {/* Welcome user by name */}
        
        {/* First Row: Summary, This Month, Next Month */}
        <div className="shared-container">
          {/* summary box */}
          <div className="shared-box">
            <h2>Summary</h2>
            {currentMonthData.totalBudget === 0 && currentMonthData.totalSpent === 0 ? (
              <p className="empty-message"> No date available yet. Head over to budget page to add your first category!</p>
            ) : ( 
              <>
              <p>Balance: <span className="green-text">${currentMonthData.totalBudget.toFixed(2)}</span></p>
              <p>Spending: <span className="red-text">-${currentMonthData.totalSpent.toFixed(2)}</span></p>
              <hr />
              <p>${remainingBalance.toFixed(2)}</p>
              </>
            )}
          </div>

          {/* This Month Chart */}
          <div className="shared-box">
            <h2>This Month</h2>
            {currentMonthData.totalSpent > 0 || currentMonthData.totalBudget > 0 ? (
              <BudgetPieChart spent={currentMonthData.totalSpent} budget={currentMonthData.totalBudget} />
            ) : (
              <p>No information yet. Head over to the budget page to add a category!</p>
            )}
          </div>

          {/* Last Month Chart */}
          <div className="shared-box">
            <h2>Last Month</h2>
            {lastMonthData.totalSpent > 0 || lastMonthData.totalBudget > 0 ? (
              <BudgetPieChart spent={lastMonthData.totalSpent} budget={lastMonthData.totalBudget} />
            ) : (
              <p> No information yet. Head over to the budget page to add a category!</p>
            )}
          </div>
        </div>

        {/* Second Row: Tasks, Transactions, Calendar */}
        <div className="shared-container">
          <div className="shared-box">
            <h2>Tasks</h2>
            <ul className="task-list">
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <li key={index}>
                    <p>{task.task_name} - Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  </li>
                ))
              ) : (
                <p>No upcoming tasks. Head over to the Tasks page to begin adding tasks!</p>
              )}
            </ul>
          </div>

          <div className="shared-box">
            <h2>Transactions</h2>
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={index}>
                  <p>{transaction.whoIsPaying} paid {transaction.whoIsGettingPaid}: ${transaction.transactionAmount}</p>
                  <p>Date: {transaction.transactionDate}</p>
                  <p>Note: {transaction.transactionNote}</p>
                </div>
              ))
            ) : (
              <p>No recent transactions available. Head over to the Transactions page to begin adding transactions!</p>
            )}
          </div>

          <div className="shared-box">
            <h2>Calendar</h2>
            <div className="calendar-box">
              <Calendar
                onChange={setDate}
                value={date}
                tileClassName={({ date, view }) => {
                  if (date.toDateString() === new Date().toDateString()) {
                    return 'highlight';
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;