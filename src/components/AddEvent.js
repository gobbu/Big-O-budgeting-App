import React, { useState } from 'react';
import './AddEvent.css';

const AddEvent = ({onClose, fetchEvents, date, 
    // closeSchedule
}) =>{

    //inputs we want: Event name, Start, End, Notes
    const [eventName, setEventName] = useState('')
    const [eventStart, setEventStart] = useState('00:00')
    const [eventEnd, setEventEnd] = useState('00:00')
    const [eventNotes, setEventNotes] = useState('')
    const [eventLocation, setEventLocation] = useState('')


    //handling improper time inputs
    const [error, setError] = useState("");

    const handleStartChange = (e) => {
        const startTime = e.target.value;
        setEventStart(startTime);

        // Ensure the end time is after the start time
        if (eventEnd <= startTime) {
            setEventEnd(startTime); // Adjust end time if it's before start time
        }
    };

    const handleEndChange = (e) => {
        const endTime = e.target.value;

        // Check if the end time is after the start time
        if (endTime <= eventStart) {
            setError("End time must be after the start time.");
        } else {
            setError("");
            setEventEnd(endTime);
        }
    };

    // handles date conversion into sql
    const formatSQLDate = (date) => { 
        const d = new Date(date); 
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(d.getDate()).padStart(2, '0'); // Days are not
        return `${year}-${month}-${day}`;
    };
  
    // console.log(formatSQLDate(date), "selected date")

    function convertPhpTime(timeString, dateString){
        const dateTimeStr = `${dateString}T${timeString}:00`; // Adding seconds for complete ISO format
        const date = new Date(dateTimeStr);

    // Convert to PHP timestamp (seconds since the Unix epoch)
    return Math.floor(date.getTime() / 1000);
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        
        const eventData = {
            event_name: eventName,
            event_start: convertPhpTime(eventStart, formatSQLDate(date)),
            event_end: convertPhpTime(eventEnd, formatSQLDate(date)),
            event_notes: eventNotes,
            event_location: eventLocation
        };
        try{
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/events.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from PHP:', errorText);
                alert(`Error adding event: ${errorText}`);
                throw new Error('Failed to create event');
            }
    
            console.log('Event added successfully');

            fetchEvents();
            onClose();
            // closeSchedule();
        
        }
        catch(error){
            console.log("Failed to submit event:", error);
        }
    }
    const handleClose = async (e)=>{
        e.preventDefault();

        onClose();
        // closeSchedule();
    }

    return(
        <div className = "add-event-popup">
            <h2>New Event</h2>
            <form onSubmit = {handleSubmit}>
                <div>
                    <label>Event Name</label>
                    <input
                        type="text"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        maxLength={128}
                        required
                    />
                    <span>{eventName.length}/128 characters</span>
                </div>

                <div>
                    <label>Event Location</label>
                    <input
                        type="text"
                        value={eventLocation}
                        onChange={(e) => setEventLocation(e.target.value)}
                        maxLength={128}

                    />
                    <span>{eventLocation.length}/128 characters</span>
                </div>
                <div className = "add-event-time-inputs">
                    <div>
                        <label htmlFor="eventStart">Starting Time</label>
                        <input
                            type="time"
                            id="eventStart"
                            value={eventStart}
                            onChange={handleStartChange}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="eventEnd">Ending Time</label>
                        <input
                            type="time"
                            id="eventEnd"
                            value={eventEnd}
                            onChange={handleEndChange}
                            required
                        />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                </div>

                <div>
                    <label>Notes</label>
                    <textarea
                        value={eventNotes}
                        onChange={(e) => setEventNotes(e.target.value)}
                        maxLength={512}
                    />
                    <span>{eventNotes.length}/512 characters</span>
                </div>

                <div className="add-event-form-buttons">
                    <button type="submit">Add</button>
                    <button className = 'cancel' type="button" onClick={handleClose}>Cancel</button>
                </div>

            </form>

        </div>
    );
}

export default AddEvent