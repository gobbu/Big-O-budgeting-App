import React, { useState, useEffect } from "react";
import "./WorkHours.css";
import Navbar from './Navbar';

const WorkHours = ({ setCurrentPage, handleLogout }) => {
    const appUrl = process.env.REACT_APP_URL;

    // Sidebar logic
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

    const navigateToPage = (page) => {
        setCurrentPage(page);
    };

    // State variables for Work Hours page logic
    const [workHours, setWorkHours] = useState({});
    const [inputDate, setInputDate] = useState('');
    const [inputHours, setInputHours] = useState('');
    const [selectedJob, setSelectedJob] = useState('');
    const [jobList, setJobList] = useState([]);
    const [weeklyJobHours, setWeeklyJobHours] = useState({}); // State for weekly job hours

    // Get work hours for each day of the current month
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetchWorkHoursForMonth();
        fetchWeeklyJobHours(); // Fetch weekly job hours on initial load and whenever currentDate changes
    }, [currentDate]); 

    // Helper function to get current week dates in YYYYMMDD format
    const getCurrentWeekDates = () => {
        const today = new Date();

        // Find the first day (Sunday) of the current week
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - today.getDay());

        // Find the last day (Saturday) of the current week
        const lastDay = new Date(firstDay);
        lastDay.setDate(firstDay.getDate() + 6);

        // Function to format a date in YYYYMMDD format
        const formatDateForBackend = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        return {
            startOfWeek: formatDateForBackend(firstDay),
            endOfWeek: formatDateForBackend(lastDay),
            display: `${firstDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} to ${lastDay.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`
        };
    };

    function getFormattedDateWithDay(date, newDay) {
        // Clone the date to avoid modifying the original
        const newDate = new Date(date.getTime());
        
        // Set the day of the month to the specified new day
        newDate.setDate(newDay);
    
        // Format the date to YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = (newDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = newDate.getDate().toString().padStart(2, '0');
    
        return `${year}-${month}-${day}`;
    }

    const fetchWorkHoursForMonth = async () => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();
        let workHoursData = {};

        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}${month}${String(day).padStart(2, '0')}`;
            try {
                const response = await fetch(`${appUrl}/backend/work_hours.php?date=${date}`, {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (!response.ok) {
                    workHoursData[date] = { hours: 0, payment: 0 };
                } else {
                    const data = await response.json();
                    workHoursData[date] = {
                        hours: data.hoursWorked,
                        payment: data.dayPayment,
                    };
                }
            } catch (error) {
                console.error('Failed to fetch work hours:', error);
                workHoursData[date] = { hours: 0, payment: 0 };
            }
        }
        setWorkHours(workHoursData);
    };

    // Fetch jobs for dropdown
    useEffect(() => {
        const fetchJobs = async () => { 
            try { 
                const response = await fetch(`${appUrl}/backend/fetch_jobs.php`, {
                    method: 'GET', 
                    credentials: 'include', 
                });
                console.log(response);
                if (!response.ok){
                    console.error('Failed to fetch jobs');
                    return;
                }
                const data = await response.json(); 
                console.log(data);
                if (Array.isArray(data)){
                    setJobList(data);
                } else{
                    console.warn('No Jobs found for the user.'); 
                }
            } catch (error){
                console.error('Error fetching jobs', error);
            }
        };
        fetchJobs();
    }, []);

    // Fetch weekly job hours for the side panel
    const fetchWeeklyJobHours = async () => {
        const { startOfWeek, endOfWeek } = getCurrentWeekDates();

        try {
            const response = await fetch(`${appUrl}/backend/fetch_weekly_hours.php?start=${startOfWeek}&end=${endOfWeek}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Failed to fetch weekly job hours');
                setWeeklyJobHours({}); // Set to empty object if no data found
                return;
            }

            const data = await response.json();
            if (typeof data === 'object') {
                setWeeklyJobHours(data);
            } else {
                console.warn('No weekly data found for the user.');
                setWeeklyJobHours({});
            }
        } catch (error) {
            console.error('Error fetching weekly job hours:', error);
            setWeeklyJobHours({}); // Set to empty object in case of an error
        }
    };

    // Send post request to backend to add hours into the table
    const handleAddEntry = async () => {
        if (!inputDate || !inputHours || !selectedJob) {
            alert('Please fill out all fields before adding an entry.');
            return;
        }

        const newEntry = {
            jobTitle: selectedJob,
            workDate: inputDate.replaceAll('-', ''),
            hoursWorked: parseFloat(inputHours),
        };

        try {
            const response = await fetch(`${appUrl}/backend/work_hours.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newEntry),
            });

            const data = await response.json();
            if (data.status === 'success') {
                alert('Work hours added successfully!');
                setInputDate('');
                setInputHours('');
                setSelectedJob('');

                // Refresh the calendar and weekly job hours panel after add entry is clicked by user
                fetchWorkHoursForMonth();
                fetchWeeklyJobHours();

            } else {
                alert(data.message || 'Failed to add work hours.');
            }
        } catch (error) {
            console.error('Error adding work hours:', error);
        }
    };

    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const renderHeader = () => {
        return (
            <div className="calendar-header">
                <div className="month-year-container">
                    <button className="calendar-button" onClick={prevMonth}>{"<"}</button>
                    <div className="month-year">
                        {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                    </div>
                    <button className="calendar-button" onClick={nextMonth}>{">"}</button>
                </div>
                <div className="week-range">{getCurrentWeekDates().display}</div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return (
            <div className="days">
                {days.map(day => (
                    <div className="day" key={day}>{day}</div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = monthStart.getDay(); // Day of the week the month starts (0 = Sunday, 6 = Saturday)
        const totalDays = monthEnd.getDate(); // Number of days in the month

        const rows = [];
        let cells = [];

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < startDay; i++) {
            cells.push(<div className="cell empty" key={`empty-start-${i}`} />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= totalDays; day++) {
            const dateKey = `${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(day).padStart(2, '0')}`;
            const workHoursForDay = workHours[dateKey];

            //old funciotn where current day is not displayed
            // cells.push(
            //     <div className="cell" key={day}>
            //         {day}
            //         {workHoursForDay && (
            //             <>
            //                 <div>{workHoursForDay.hours} hours</div>
            //                 <div>${workHoursForDay.payment}</div>
            //             </>
            //         )}
            //     </div>
            // );

            //check if this day is the current month 
            const today = new Date().toISOString().split('T')[0]; // Get today's date in "YYYY-MM-DD" format
            const key = getFormattedDateWithDay(currentDate, day);
            const isToday = key === today;

            cells.push(
                <div className={`cell ${isToday ? 'current-day' : ''}`} key={day}>
                    {day}
                    {workHoursForDay && (
                        <>
                            <div>{workHoursForDay.hours} hours</div>
                            <div>${workHoursForDay.payment}</div>
                        </>
                    )}
                </div>
            );


            // If the week is complete (7 cells), push the row
            if ((day + startDay) % 7 === 0) {
                rows.push(<div className="row" key={day}>{cells}</div>);
                cells = [];
            }
        }

        // Push the last row (which might not have 7 cells)
        if (cells.length) {
            rows.push(<div className="row" key="last-row">{cells}</div>);
        }

        return <div className="cells">{rows}</div>;
    };

    // Render weekly job hours panel
    const renderWeeklyJobHoursPanel = () => {
        const totalHours = Object.values(weeklyJobHours).reduce((total, hours) => total + hours, 0);

        return (
            <div className="weekly-job-hours-panel">
                <h3>Jobs</h3>
                {Object.entries(weeklyJobHours).length === 0 ? (
                    <p>No jobs available for this week.</p>
                ) : (
                    Object.entries(weeklyJobHours).map(([jobTitle, hours], index) => (
                        <div key={index} className="job-hours-entry">
                            <span>{jobTitle}:</span>
                            <span>{hours} hours</span>
                        </div>
                    ))
                )}
                <div className="job-hours-total">
                    <strong>Total:</strong>
                    <span>{totalHours} hours</span>
                </div>
            </div>
        );
    };

    return (
        <div className="workhours-container">
            <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />

            <div className="content-wrapper">
                <div className="workhours-calendar-container">
                    <div className="calendar-container">
                        {/* Use the renderHeader function here */}
                        {renderHeader()}
                        {renderDays()}
                        {renderCells()}
                    </div>

                    <div className="right-side-container">
                        <div className="workhours-input-box">
                            <h2>Add Work Hours</h2>
                            <input
                                type="date"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                            />
                            <input
                                type="number"
                                value={inputHours}
                                onChange={(e) => setInputHours(e.target.value)}
                                placeholder="Hours Worked"
                            />
                            <select
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                                className="workhours-input-select"
                            >
                                <option value="">Select Job</option>
                                {jobList.map((job, index) => (
                                    <option key={index} value={job.jobTitle}>
                                        {job.jobTitle}
                                    </option>
                                ))}
                            </select>
                            <button onClick={handleAddEntry}>Add Entry</button>
                        </div>

                        <div className="weekly-job-hours-panel">
                            <h3>Jobs</h3>
                            {Object.entries(weeklyJobHours).length === 0 ? (
                                <p>No jobs available for this week.</p>
                            ) : (
                                Object.entries(weeklyJobHours).map(([jobTitle, hours], index) => (
                                    <div key={index} className="job-hours-entry">
                                        <span>{jobTitle}:</span>
                                        <span>{hours} hours</span>
                                    </div>
                                ))
                            )}
                            <div className="job-hours-total">
                                <strong>Total:</strong>
                                <span>
                                    {Object.values(weeklyJobHours).reduce((total, hours) => total + hours, 0)} hours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkHours;