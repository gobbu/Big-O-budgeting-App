import React, { useState, useEffect } from "react";
import "./Calendar.css";
import Navbar from './Navbar';
import Schedule from './Schedule'

const Calendar = ({setCurrentPage, handleLogout})=>{
    const appUrl = process.env.REACT_APP_URL;

    const [showSchedule, setShowSchedule] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentWeek, setCurrentWeek] = useState("");
    const [events, setEvents] = useState([]);

    const toggleSchedulePopup = (day) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        setSelectedDate(date);
        setShowSchedule(!showSchedule);
    };

    function convertTime(phpTimestamp) {
        const jsTimestamp = phpTimestamp * 1000;
        const date = new Date(jsTimestamp);
        const hours = date.getHours().toString().padStart(2, '0'); // Pad with zero if needed
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const refreshEvents = async () =>{
        await fetchEvents();
    }

    const fetchEvents = async () => {
        try { 
            const url = `${appUrl}/backend/fetch_schedule.php`;
    
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Failed to fetch events: ' + errorText);
            }
    
            const textResponse = await response.text();
            if (textResponse.trim() === "") {
                throw new Error('Empty Response');
            }
    
            const data = JSON.parse(textResponse);
            const dataMessage = data['message'];
    
            // Iterate over the dictionary of dates
            for (const [date, details] of Object.entries(dataMessage)) {
                const eventsList = details["events"];
                // const taskCount = details["tasks"];
    
                // Convert event start and end times for each event
                if (eventsList && eventsList.length > 0) {
                    eventsList.forEach(event => {
                        event.event_start = convertTime(event.event_start);
                        event.event_end = convertTime(event.event_end);
                    });
                }
    
                // // Optionally, you can log or use taskCount here if needed
                // console.log(`Tasks on ${date}: ${taskCount}`);
            }
    
            // Set the events with the updated data structure
            setEvents(dataMessage);
            renderCells();
    
        } catch (error) {
            console.log("Error, failed to set events", error);
        }
    };
    
   
    // Calendar logic
    const getWeekRange = () =>{
        const today = new Date();
    
        // Find the first day (Sunday) of the current week
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
    
        // Find the last day (Saturday) of the current week
        const lastDay = new Date(today.setDate(firstDay.getDate() + 6));

        // Format options for the dates (e.g., "October 7th")
        const options = { month: 'long', day: 'numeric' };

        // Format the first and last day of the week
        const startOfWeek = firstDay.toLocaleDateString(undefined, options);
        const endOfWeek = lastDay.toLocaleDateString(undefined, options);

        return `Current Week: ${startOfWeek} to ${endOfWeek}`;
    }

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

    // activating everything
    useEffect(()=>{
        setCurrentWeek(getWeekRange());
        fetchEvents();
    }, [])

    const renderHeader = () => {
        return (
            <div className = "calendar-page-header">
                <button
                    className = "calendar-button" 
                    onClick={prevMonth}>{"<"}
                    <span className = "tooltip">Previous Month</span>
                </button>
                <div className = "calendar-info">
                <h2>
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric"})}
                </h2>
                
                </div>
                <button 
                    className = "calendar-button"
                    onClick = {nextMonth}>{">"}
                    <span className = "tooltip">Next Month</span>
                </button>
                <div className = "week-info">{currentWeek}</div>
            </div>
        );
    };

    const prevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const renderDays = () => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        return (
            <div className = "days">
                {days.map(day => (
                    <div className="day" key={day}>{day}</div>
                ))}
            </div>
        );
    };

    const getTaskColorClass = (totalTasks) => {
        if (totalTasks === 0) return 'task-black';
        if (totalTasks >= 1 && totalTasks <= 4) return 'task-green';
        if (totalTasks >= 5 && totalTasks <= 9) return 'task-yellow';
        if (totalTasks >= 10) return 'task-red';
    };

    const renderCells = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDay = monthStart.getDay();
        const totalDays = monthEnd.getDate();
    
        const today = new Date().toLocaleDateString('en-CA').split('T')[0]; // Get today's date in "YYYY-MM-DD" format
        const rows = [];
        let cells = [];
    
        // Add empty cells for the days before the start of the month
        for (let i = 0; i < startDay; i++) {
            cells.push(<div className="empty-cell" key={`empty-start-${i}`} />);
        }
    
        // Iterate through all days of the current month
        for (let day = 1; day <= totalDays; day++) {
            const key = getFormattedDateWithDay(currentDate, day);
            const today_dict = events[key] || [];
            const event_list = today_dict['events'] || [];

            // console.log(event_list, "event list of ", key) 
            const totalTasks = today_dict['tasks'] || 0;
            // console.log(totalTasks, "tasks of day", key)
    
            // Check if the current day is today's date
            const isToday = key === today;

            // console.log(today, "today")
            // console.log(key, "key")
            // console.log(isToday, "is today?")
    
            // Apply conditional styling for today's date
            const cellClass = isToday ? "calendar-cell today-cell" : "calendar-cell";
    
            cells.push(
                <div className={cellClass} key={day} onClick={() => toggleSchedulePopup(day)}>
                    {day}
                    <div className = {getTaskColorClass(totalTasks)}>Tasks: {totalTasks}</div>
                    <div className = {getTaskColorClass(event_list.length)}>Events: {event_list.length}</div>
                </div>
            );
    
            // Start a new row after every 7 days
            if ((day + startDay) % 7 === 0) {
                rows.push(<div className="row" key={day}>{cells}</div>);
                cells = [];
            }
        }
    
        // Add empty cells for the days after the end of the month
        for (let i = monthEnd.getDay() + 1; i < 7; i++) {
            cells.push(<div className="cell empty" key={`empty-end-${i}`} />);
        }
    
        // Add the final row to the grid
        rows.push(<div className="row" key="last-row">{cells}</div>);
    
        return <div className="cells">{rows}</div>;
    };
    

    return(
        <div className = "calendar-page">
            <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
        <div className="content-wrapper">
            {/* calendar page display */}
            
        <div className="calendar-container">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>

            {showSchedule && (
                <div className="schedule-overlay" onClick={() => setShowSchedule(false)}>
                    <div className="schedule-popup" onClick={(e) => e.stopPropagation()}>
                        <Schedule onClose = {toggleSchedulePopup} fetchEvents = {refreshEvents} events = {events} date={selectedDate}  />
                        {/* <button className="close-button" onClick={() => setShowSchedule(false)}>✕</button> */}
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

export default Calendar