import React, { useState } from 'react';
import './EditTaskModal.css';

const EditTaskModal = ({ onClose, fetchTasks, task }) => {
    const taskID = task.id;
    const [taskName, setTaskName] = useState(task.taskName);
    const [dueDate, setDueDate] = useState(task.dueDate);
    const [taskNote, setTaskNote] = useState(task.taskNote);
 

    // for backend functions
    // const appURL = process.env.REACT_APP_URL;
    // console.log(task);
    // console.log('task info below')
    // console.log(taskID, taskName, dueDate, taskNote)

    

    // Function to format date into SQL date format
    const formatSQLDate = (date) => { 
        const d = new Date(date); 
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()+1).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const taskData = {
            id: Number(taskID),
            task_name: taskName,
            due_date: formatSQLDate(dueDate),
            task_notes: taskNote,
            task_complete: 0,
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/edit_task.php`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert(`Error editing task: ${errorText}`);
                throw new Error('Failed to edit task');
            }

            console.log('Task edited successfully');
            fetchTasks(); 
            onClose(); 
        } catch (error) {
            console.error('Error editing task:', error);
            alert("Error editing task: " + error);
        }
    };

    const deleteTask = async (e) => {
        e.preventDefault();
        const taskData = {
            id: Number(taskID),
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_URL}/backend/edit_task.php`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                alert(`Error deleting task: ${errorText}`);
                throw new Error('Failed to delete task');
            }

            console.log('Task deleted successfully');
            fetchTasks(); 
            onClose(); 
        } catch (error) {
            console.error('Error deleting task:', error);
            alert("Error deleting task: " + error);
        }
    };

    return (
        // <div className="modal-background" onClick={onClose}>
            <div className="edit-task-popup" onClick={(e) => e.stopPropagation()}>
                <h2>Edit Task</h2>
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
                        <button type="submit">Save</button>
                        <button className = 'delete' type = "button" onClick ={deleteTask}>Delete</button>
                        <button className = 'cancel' type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        // </div>
    );
};

export default EditTaskModal;
