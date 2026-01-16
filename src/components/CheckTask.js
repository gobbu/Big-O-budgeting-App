export const handleCheckboxChange = async (index, setTasks, tasks) => {
    const taskUpdated = tasks[index];
    const completion = taskUpdated.taskComplete;

    // Confirm with the user
    const confirmCheck = window.confirm(
        `Are you sure you want to ${completion ? "uncheck this task?" : "check off this task?" }`
    );
    if (!confirmCheck) {
        return;
    }

    // Update local state
    const updatedTasks = tasks.map((task, i) => {
        if (i === index) {
            return { ...task, taskComplete: !task.taskComplete };
        }
        return task;
    });
    setTasks(updatedTasks);

    // Prepare data for the server
    const taskData = {
        id: taskUpdated.id,
        task_complete: !taskUpdated.taskComplete,
    };

    try {
        // Make an asynchronous call to the server
        const response = await fetch(`${process.env.REACT_APP_URL}/backend/task_page.php`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Parse the server's error response
            const errorMessage = errorData.message || 'Failed to update task status'; // Use server message or a fallback
            alert(errorMessage);
            throw new Error(errorMessage);
        }

        console.log('Task status updated successfully on the server');
    } catch (error) {
        console.error('Error updating task status:', error);

        // Roll back local state if the server update fails
        const rollbackTasks = tasks.map((task, i) => {
            if (i === index) {
                return { ...task, taskComplete: task.taskComplete }; // Roll back to original state
            }
            return task;
        });
        setTasks(rollbackTasks);
    }
};
