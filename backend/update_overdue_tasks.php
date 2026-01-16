<?php

include 'connect.php'; 

$today_date = date("Y-m-d");

$fetch_tasks = "SELECT due_date, id FROM tasks WHERE overdue = 0"; // filter for tasks that aren't overdue yet
$stmt = $conn->prepare($fetch_tasks);

$tasks = [];

if ($stmt->execute()){
    // populates the list of tasks with lists of [date, id] format 
    $result = $stmt ->get_result();

    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row; // Add each row (associative array) to the tasks list
    }
}
else{
    echo json_encode(['status' => 'error', 'message' => 'Failed to connect to tasks table']);
}
$stmt->close();

$update_query = "UPDATE tasks SET overdue = 1 WHERE id = ?";
$stmt = $conn->prepare($update_query);

foreach ($tasks as $task) {
    if ($task['due_date'] <= $today_date) {
        $stmt->bind_param("i", $task["id"]);
        if ($stmt->execute()) {
            echo "Updated task ID " . $task['id'] . " successfully!<br>";
        } else {
            echo "Failed to update task ID " . $task['id'] . ": " . $stmt->error . "<br>";
        }
    }
}

$stmt->close();