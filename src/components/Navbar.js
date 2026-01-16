
// import React from 'react';
// import './Navbar.css';

// const Navbar = ({ setCurrentPage, handleLogout }) => {
//     const appUrl = process.env.REACT_APP_URL;

//     const logout = () => {
//         console.log("logging out");
//         fetch(`${appUrl}/backend/logout.php`, {
//             method: 'POST',
//             credentials: 'include',
//         })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.status === 'success') {
//                 handleLogout(); // Update the auth state and navigate to the login page
//             } else {
//                 alert('Failed to log out.');
//             }
//         })
//         .catch((error) => {
//             console.error('Error logging out:', error);
//         });
//     };
    
//     const navigateToPage = (page) => {
//         console.log("changing pages...");
//         setCurrentPage(page);
//     };

//     return (
//         <div className="sidebar">
//             <div className="sidebar-content">
//                 <button className="sidebar-button" onClick={() => navigateToPage('home')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/homepage_icon.png" alt="Homepage Icon" className="button-icon" />
//                     Homepage
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('calendar')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/calendar_icon.png" alt="Calendar Icon" className="button-icon" />
//                     Calendar
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('rewards')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/rewards_icon.png" alt="Rewards Icon" className="button-icon" />
//                     Rewards
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('tasks')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/tasks_icon.png" alt="Tasks Icon" className="button-icon" />
//                     Tasks
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('budget')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/budget_icon.png" alt="Budget Icon" className="button-icon" />
//                     Budget
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('payments')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/payments_icon.png" alt="Payments Icon" className="button-icon" />
//                     Payments
//                 </button>
//                 <button className="sidebar-button" onClick={() => navigateToPage('work hours')}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/workhours_icon.png" alt="Work Hours Icon" className="button-icon" />
//                     Work Hours
//                 </button>
//                 <button className="sidebar-button" onClick={logout}>
//                     <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/logout_icon.png" alt="Logout Icon" className="button-icon" />
//                     Logout
//                 </button>
//             </div>
//         </div> 
//     );
// };

// export default Navbar;



//new navbar with hamburger button: 
// import React, { useState } from 'react';
// import './Navbar.css';

// const Navbar = ({ setCurrentPage, handleLogout }) => {
//     const appUrl = process.env.REACT_APP_URL;
//     const [isNavbarVisible, setIsNavbarVisible] = useState(true);

//     const toggleNavbar = () => {
//         setIsNavbarVisible(!isNavbarVisible);
//     };

//     const logout = () => {
//         console.log("logging out");
//         fetch(`${appUrl}/backend/logout.php`, {
//             method: 'POST',
//             credentials: 'include',
//         })
//         .then((response) => response.json())
//         .then((data) => {
//             if (data.status === 'success') {
//                 handleLogout();
//             } else {
//                 alert('Failed to log out.');
//             }
//         })
//         .catch((error) => {
//             console.error('Error logging out:', error);
//         });
//     };
    
//     const navigateToPage = (page) => {
//         console.log("changing pages...");
//         setCurrentPage(page);
//     };

//     return (
//         <div className={`sidebar ${isNavbarVisible ? '' : 'collapsed'}`}>
//             <button className="hamburger-button" onClick={toggleNavbar}>
//                 <img 
//                     src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/hamburger_menu.png"
//                     alt="Menu" 
//                     className="hamburger-icon"
//                 />
//             </button>
//             {isNavbarVisible && (
//                 <div className="sidebar-content">
//                     <button className="sidebar-button" onClick={() => navigateToPage('home')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/homepage_icon.png" alt="Homepage Icon" className="button-icon" />
//                         Homepage
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('calendar')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/calendar_icon.png" alt="Calendar Icon" className="button-icon" />
//                         Calendar
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('rewards')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/rewards_icon.png" alt="Rewards Icon" className="button-icon" />
//                         Rewards
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('tasks')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/tasks_icon.png" alt="Tasks Icon" className="button-icon" />
//                         Tasks
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('budget')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/budget_icon.png" alt="Budget Icon" className="button-icon" />
//                         Budget
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('payments')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/payments_icon.png" alt="Payments Icon" className="button-icon" />
//                         Payments
//                     </button>
//                     <button className="sidebar-button" onClick={() => navigateToPage('work hours')}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/workhours_icon.png" alt="Work Hours Icon" className="button-icon" />
//                         Work Hours
//                     </button>
//                     <button className="sidebar-button" onClick={logout}>
//                         <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/logout_icon.png" alt="Logout Icon" className="button-icon" />
//                         Logout
//                     </button>
//                 </div>
//             )}
//         </div> 
//     );
// };

// export default Navbar;


//newer navbar where mobile users have navbar already collapsed 
import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ setCurrentPage, handleLogout }) => {
    const appUrl = process.env.REACT_APP_URL;

    // Initialize navbar visibility based on screen width
    const [isNavbarVisible, setIsNavbarVisible] = useState(window.innerWidth > 768);

    // Add event listener to handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsNavbarVisible(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleNavbar = () => {
        setIsNavbarVisible(!isNavbarVisible); 
    };

    const logout = () => {
        console.log("logging out");
        fetch(`${appUrl}/backend/logout.php`, {
            method: 'POST',
            credentials: 'include',
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 'success') {
                handleLogout();
            } else {
                alert('Failed to log out.');
            }
        })
        .catch((error) => {
            console.error('Error logging out:', error);
        });
    };
    
    const navigateToPage = (page) => {
        console.log("changing pages...");
        setCurrentPage(page);
    };

    return (
        <div className={`sidebar ${isNavbarVisible ? '' : 'collapsed'}`}>
            <button className="hamburger-button" onClick={toggleNavbar}>
                <img 
                    src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/alee76/build/images/hamburger_menu.png"
                    alt="Menu" 
                    className="hamburger-icon"
                />
            </button>
            {isNavbarVisible && (
                <div className="sidebar-content">
                    <button className="sidebar-button" onClick={() => navigateToPage('home')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/homepage_icon.png" alt="Homepage Icon" className="button-icon" />
                        Homepage
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('calendar')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/calendar_icon.png" alt="Calendar Icon" className="button-icon" />
                        Calendar
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('rewards')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/rewards_icon.png" alt="Rewards Icon" className="button-icon" />
                        Rewards
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('tasks')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/tasks_icon.png" alt="Tasks Icon" className="button-icon" />
                        Tasks
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('budget')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/budget_icon.png" alt="Budget Icon" className="button-icon" />
                        Budget
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('payments')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/payments_icon.png" alt="Payments Icon" className="button-icon" />
                        Records
                    </button>
                    <button className="sidebar-button" onClick={() => navigateToPage('work hours')}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/workhours_icon.png" alt="Work Hours Icon" className="button-icon" />
                        Work Hours
                    </button>
                    <button className="sidebar-button" onClick={logout}>
                        <img src="https://se-dev.cse.buffalo.edu/CSE442/2024-Fall/wesleyme/build/images/logout_icon.png" alt="Logout Icon" className="button-icon" />
                        Logout
                    </button>
                </div>
            )}
        </div> 
    );
};

export default Navbar;