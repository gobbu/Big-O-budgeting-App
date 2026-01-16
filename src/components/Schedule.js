import React, { useState, useEffect, useCallback } from 'react';
import './Schedule.css';
import AddEvent from './AddEvent';
import EditEvent from './EditEvent';

const Schedule = ({ onClose, fetchEvents, events, date }) => {
    const appUrl = process.env.REACT_APP_URL;

    const [currentEvents, setCurrentEvents] = useState(events);
    const [schedule, setSchedule] = useState([]);
    const [timeBlocks, setTimeBlocks] = useState([]);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showEditEvent, setShowEditEvent] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const [showDailyEvents, setShowDailyEvents] = useState(false);
    const [DailyEventsData, setDailyEventsData] = useState({
        payments: [],
        tasks: [],
        work_hours: [],
        pay_cycles: [],
        pay_stubs: []
    });

    const keyDate = date.toISOString().split('T')[0];

    const getTimeParts = (time) => {
        if (!time || typeof time !== 'string') {
            console.error('Invalid time format:', time);
            return { hour: 0, minute: 0 }; // Return default time parts
        }
        const [timePart, ampm] = time.split(' ');
        const [hour, minute] = timePart.split(':').map(Number);
        return {
            hour: ampm === 'PM' && hour < 12 ? hour + 12 : (ampm === 'AM' && hour === 12 ? 0 : hour),
            minute,
        };
    };
    
    const formatTime = (time) => {
        const { hour, minute } = getTimeParts(time);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
    };

    const generateTimeBlocks = () => {
        const blocks = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                blocks.push(`${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`);
            }
        }
        return blocks;
    };

    useEffect(() => {
        setTimeBlocks(generateTimeBlocks());
    }, []);

    const updateSchedule = useCallback(() => {
        setSchedule(currentEvents[keyDate]?.events || []);
    }, [currentEvents, keyDate]);

    useEffect(() => {
        setCurrentEvents(events);
    }, [events]);

    useEffect(() => {
        updateSchedule();
    }, [currentEvents, updateSchedule]);

    const renderTable = () => {
        const renderedRows = timeBlocks.map((timeBlock, index) => {
            const event = schedule.find((evt) => {
                if (!evt.event_start || !evt.event_end) return false;

                const startParts = getTimeParts(evt.event_start);
                const endParts = getTimeParts(evt.event_end);
                const blockParts = getTimeParts(timeBlock);

                const startTime = startParts.hour * 60 + startParts.minute;
                const endTime = endParts.hour * 60 + endParts.minute;
                const blockTime = blockParts.hour * 60 + blockParts.minute;

                return blockTime >= startTime && blockTime < endTime;
            });

            return (
                <div
                    key={index}
                    className={`time-block ${event ? 'occupied' : 'empty-block'}`}
                    onClick={() => event && handleEditEventModal(event)}
                >
                    <span className="time-label">{timeBlock}</span>
                    {event && (
                        <div className="event-details">
                            <span className="event-name">
                                <strong>Event:</strong> {event.event_name}
                            </span>
                            <br />
                            <span className="event-time">
                                <strong>Time:</strong> {formatTime(event.event_start)} - {formatTime(event.event_end)}
                            </span>
                            <br />
                            <span className="event-location">
                                <strong>Location:</strong> {event.event_location}
                            </span>
                        </div>
                    )}
                </div>
            );
        });

        return <div className="schedule-grid">{renderedRows}</div>;
    };

    const handleEditEventModal = (event) => {
        setSelectedEvent(event);
        setShowEditEvent(true);
    };

    const toggleAddEventPopup = () => {
        setShowAddEvent(!showAddEvent);
    };

    const toggleScheduleView = () => {
        setShowDailyEvents(!showDailyEvents);
        if (!showDailyEvents) {
            fetchDailyEventsData();
        }
    };

    const fetchDailyEventsData = async () => {
        try {
            const url = `${appUrl}/backend/fetch_daily_events.php?date=${date.toISOString().split('T')[0]}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            const data = await response.json();

            if (data.status === 'success') {
                setDailyEventsData({
                    payments: data.data.payments || [],
                    tasks: data.data.tasks || [],
                    work_hours: data.data.work_hours || [],
                    pay_cycles: data.data.pay_cycles || [],
                    pay_stubs: data.data.pay_stubs || []
                });
            } else {
                console.error('Failed to fetch Daily Events data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching Daily Events data:', error);
        }
    };

    const DailyEvents = ({ data }) => {
        const allEvents = [
            ...data.payments.map(item => ({ ...item, type: 'Payment' })),
            ...data.tasks.map(item => ({ ...item, type: 'Task' })),
            ...data.work_hours.map(item => ({ ...item, type: 'Work Hours' })),
            ...data.pay_cycles.map(item => ({ ...item, type: 'Pay Cycle' })),
            ...data.pay_stubs.map(item => ({ ...item, type: 'Pay Stub' }))
        ];

        return (
            <div className="schedule-container">
                <h2>Daily Events</h2>
                <div className="schedule-table">
                    {allEvents.length > 0 ? (
                        allEvents.map((event, index) => (
                            <div key={index} className="time-block event-block">
                                <div className="event-details">
                                    <strong>{event.event_name}</strong> <br />
                                    {event.event_notes && <span>{event.event_notes}</span>}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="time-block empty-slot">
                            <div>No events found for this date.</div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="schedule-slider-wrapper">
                <span className="slider-text">Schedule</span>
                <input
                    type="checkbox"
                    className="slider-toggle"
                    id="scheduleToggle"
                    checked={showDailyEvents}
                    onChange={toggleScheduleView}
                />
                <label className="slider-label" htmlFor="scheduleToggle"></label>
                <span className="slider-text">Daily Events</span>
            </div>
    
            <div className="schedule-container">
                <div className="schedule-button-container">
                    <button className="close-button" onClick={() => onClose(date.getDate())}>✕</button>
                    <button className="add-event-button" onClick={toggleAddEventPopup}>+</button>
                </div>
    
                <h2>Schedule for {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                <div className="schedule-table">
                    {showDailyEvents ? (
                        <DailyEvents data={DailyEventsData} />
                    ) : (
                        renderTable()
                    )}
                </div>
    
                {showAddEvent && 
                    <AddEvent 
                        onClose={toggleAddEventPopup} 
                        fetchEvents={fetchEvents} 
                        date={date}  
                    />
                }
    
                {showEditEvent && (
                    <EditEvent
                        onClose={() => setShowEditEvent(false)}
                        fetchEvents={fetchEvents}
                        date={date}
                        eventInfo={selectedEvent}
                    />
                )}
            </div>
        </>
    );    
};

export default Schedule;