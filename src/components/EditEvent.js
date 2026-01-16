import React, { useState } from 'react';
import './EditEvent.css';

const EditEvent = ({onClose, fetchEvents, 
    // fetchCurrentEvents, 
    date, eventInfo,
    // closeSchedule
}) =>{

// stuff we need
// the event that we're looking at
//the onclose function
// date
// fetchEvent

    // console.log(eventInfo)
    const [eventName, setEventName] = useState(eventInfo.event_name)
    const [eventStart, setEventStart] = useState(eventInfo.event_start)
    const [eventEnd, setEventEnd] = useState(eventInfo.event_end)
    const [eventNotes, setEventNotes] = useState(eventInfo.event_notes)
    const [eventLocation, setEventLocation] = useState(eventInfo.event_location)



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
        // console.log("submitting!")
        // onClose();
        
        const eventData = {
            id: eventInfo.event_id,
            event_name: eventName,
            event_start: convertPhpTime(eventStart, formatSQLDate(date)),
            event_end: convertPhpTime(eventEnd, formatSQLDate(date)),
            event_notes: eventNotes,
            event_location: eventLocation
            
        };
        console.log(eventData, "edited event data")
        try{
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/events.php`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from PHP:', errorText);
                alert(`Error editing event: ${errorText}`);
                throw new Error('Failed to edit event');
            }
    
            console.log('Event edited successfully');

            fetchEvents();
            // fetchCurrentEvents();
            onClose();
            // closeSchedule();
        }
        catch(error){
            console.log("Failed to edit event:", error);
        }
    }

    const handleDelete = async (e)=>{
        e.preventDefault();
        // console.log("submitting!")
        // onClose();
        
        const eventData = {
            id: eventInfo.event_id,
        };
        console.log(eventData, "deleted data")
        try{
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/events.php`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from PHP:', errorText);
                alert(`Error deleting event: ${errorText}`);
                throw new Error('Failed to delete event');
            }
    
            console.log('Event deleted successfully');

            fetchEvents();
            // fetchCurrentEvents();
            onClose();
            // closeSchedule();
        }
        catch(error){
            console.log("Failed to delete event:", error);
        }
    }

    const handleClose = async (e)=>{
        e.preventDefault();

        onClose();
        // closeSchedule();
    }

    return(
        <div className = "edit-event-popup">
            <h2>Edit Event</h2>
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
                <div className = "edit-event-time-inputs">
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

                <div className="edit-event-form-buttons">
                    <button type="submit">Save</button>
                    <button className = 'delete' type="button" onClick={handleDelete}>Delete</button>
                    <button className = 'cancel' type="button" onClick={handleClose}>Cancel</button>
                </div>

            </form>

        </div>
    );
}

export default EditEvent