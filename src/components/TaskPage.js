import React, { useState, useEffect } from 'react';
import './TaskPage.css';
import AddTask from './AddTask';
import Navbar from './Navbar';
import EditTaskModal from './EditTaskModal';
import { handleCheckboxChange } from './CheckTask';

const TaskPage = ({setCurrentPage, handleLogout}) => {
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    
    const appUrl = process.env.REACT_APP_URL;

    // Fetch tasks from the backend
    const fetchTasks = async () => {
        try {

            const url = `${appUrl}/backend/task_page.php`;

            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Failed to fetch tasks: ' + errorText);
            }

            const textResponse = await response.text();
            if (textResponse.trim() === "") {
                throw new Error('Empty Response');
            }

            const data = JSON.parse(textResponse);
            const parsedTasks = data.map((task) => ({
                id: task.id,
                taskName: task.task_name,
                dueDate: task.due_date,
                taskNote: task.task_notes,
                taskComplete: task.task_complete === 1, // Ensure taskComplete is a boolean
                overdue: task.overdue
            }));

            setTasks(parsedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert("Error message: fetching tasks: ");
        }
    };

    // useEffect(() => {
    //     console.log(tasks)
    // }, [tasks]);

    const POLLING_INTERVAL = 60000; // 1 minute in milliseconds
    useEffect(() => {
        const intervalId = setInterval(fetchTasks, POLLING_INTERVAL);
        // This will call fetchTasks every minute.
        // Clean up the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    const overdueTasks = tasks.filter((task) => (!task.taskComplete && new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) || task.overdue === 1);
    const upcomingTasks = tasks.filter((task) => !task.taskComplete && new Date(task.dueDate).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0) && task.overdue === 0);
    const completedTasks = tasks.filter((task) => task.taskComplete);

    // console.log(overdueTasks, "overdue")
    // console.log(upcomingTasks, "upcoming")
    // console.log(completedTasks, "completed")

    //toggles addtask popup appearing
    const toggleAddTaskPopup = () => {
        setShowAddTask(!showAddTask);
    };

    // handling the edit modal

    const [selectedTask, setSelectedTask] = useState(null);
    const handleEditTaskModal= (task) => {
        
        // console.log("editing");
        // console.log(task)
        setSelectedTask(task);
        // console.log("selected task: ", selectedTask)
        // console.log("current edit task value: ", showEditTask)
        setShowEditTask((prevState) => !prevState);
        
        // console.log(tasks)
    };

    return (
        
        // {/* Main Task Content */}
        <div className="task-page">
            <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />
            <div className="tasks-container">
                <h2>Tasks</h2>

                <h3>Overdue <span style={{ color: 'red' }}>!!</span></h3>
                {overdueTasks.length > 0 ? (
                    overdueTasks.map((task, index) => (
                        <div key={index} className="task-item" onClick={()=>handleEditTaskModal(task)} >
                            
                            {/* <input
                                type="checkbox"
                                checked={task.taskComplete}
                                onClick={(e) =>{e.stopPropagation();}}
                                onChange={() => handleCheckboxChange(tasks.indexOf(task), setTasks, tasks)}
                            /> */}
                            <span >{task.taskName}</span>
                            {showEditTask && <EditTaskModal onClose = {()=>handleEditTaskModal(task)} fetchTasks = {fetchTasks} task ={selectedTask}/>}
                        </div>
                    ))
                ) : (
                    <p>No overdue tasks</p>
                )}

                <h3>Upcoming</h3>
                {upcomingTasks.length > 0 ? (
                    upcomingTasks.map((task, index) => (
                        <div key={index} className="task-item" onClick={()=>handleEditTaskModal(task)} >
                            <input
                                type="checkbox"
                                checked={task.taskComplete}
                                onClick={(e) =>{e.stopPropagation();}}
                                onChange={() => handleCheckboxChange(tasks.indexOf(task), setTasks, tasks)}
                            />
                            <span >{task.taskName}</span>
                            {showEditTask && <EditTaskModal onClose = {()=>handleEditTaskModal(task)} fetchTasks = {fetchTasks} task ={selectedTask}/>}
                        </div>
                    ))
                ) : (
                    <p>No upcoming tasks</p>
                )}

                <h3>Completed</h3>
                {completedTasks.length > 0 ? (
                    completedTasks.map((task, index) => (
                        <div key={index} className="task-item completed" onClick={()=>handleEditTaskModal(task)} >
                            <input
                                type="checkbox"
                                checked={task.taskComplete}
                                onClick={(e) =>{e.stopPropagation();}}
                                onChange={() => handleCheckboxChange(tasks.indexOf(task), setTasks, tasks)}
                            />
                            <span style={{ textDecoration: 'line-through' }}>{task.taskName}</span>
                            {showEditTask && <EditTaskModal onClose = {()=>handleEditTaskModal(task)} fetchTasks = {fetchTasks} task ={selectedTask}/>}
                        </div>
                    ))
                ) : (
                    <p>No completed tasks</p>
                )}

                {/* Add task button */}
                <button onClick={toggleAddTaskPopup} className="add-task-btn">
                    <span style={{ fontSize: '24px' }}>+</span>
                </button>
            </div>

            {/* Add Task Popup */}
            {showAddTask && <AddTask onClose={toggleAddTaskPopup} fetchTasks={fetchTasks} />}
            
            </div>
    );
};

export default TaskPage;