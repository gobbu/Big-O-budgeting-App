import React, { useState } from 'react';
import './AddTask.css';

//new changes
const AddTask = ({ onClose, fetchTasks }) => {
    const [taskName, setTaskName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [taskNote, setTaskNote] = useState('');
    // const [errorText, setErrorText] = useState('');


    // Function to format date into SQL date format: year, month, day
    const formatSQLDate = (date) => { 
        const d = new Date(date); 
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(d.getDate()+1).padStart(2, '0'); // Correct the day to not add +1
        return `${year}-${month}-${day} 00:00:00`;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();




        const taskData = {
            task_name: taskName,
            due_date: formatSQLDate(dueDate),
            task_notes: taskNote,
            task_complete: 0,
        };
    
        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/add_task.php`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from PHP:', errorText);
                alert(`Error creating task: ${errorText}`);
                throw new Error('Failed to create task');
            }
    
            console.log('Task created successfully');
            fetchTasks(); //call fetchTask to refresh the task list after creation (GET request)
            onClose(); // Close the popup after task creation
        } catch (error) {
            console.error('Error creating task:', error);
            alert("Error creating task: " + error);
        }
    };

    return (
        <div className="add-task-popup">
            <h2>New Task</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Task Name</label>
                    <input
                        type="text"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        maxLength={128}
                        required
                    />
                    <span>{taskName.length}/128 characters</span>
                </div>

                <div>
                    <label>Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        min={(() => {
                            const tomorrow = new Date();
                            tomorrow.setDate(tomorrow.getDate() + 1); // Increment by 1 day
                            return tomorrow.toISOString().split("T")[0]; // Format the date
                        })()}
                    />
                </div>

                <div>
                    <label>Notes</label>
                    <textarea
                        value={taskNote}
                        onChange={(e) => setTaskNote(e.target.value)}
                        maxLength={512}
                    />
                    <span>{taskNote.length}/512 characters</span>
                </div>

                <div className="task-form-buttons">
                    <button type="submit">Create</button>
                    <button className = 'cancel' type="button" onClick={onClose}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddTask;