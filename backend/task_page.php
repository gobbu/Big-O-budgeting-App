<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");
// Include the database connection file
include 'connect.php'; // This should contain the mysqli connection logic

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];
    

    // Prepare the SQL query to fetch tasks
    $fetch_tasks = "SELECT id, task_name, due_date, task_notes, task_complete, overdue FROM tasks WHERE user_id = ?";
    $stmt = $conn->prepare($fetch_tasks);
    $stmt->bind_param("i", $user_id);

    if ($stmt->execute()) {
        
        // Get the result
        $result = $stmt->get_result();
        $tasks = array();
        // Fetch tasks into an array
        while ($row = $result->fetch_assoc()) {
            $tasks[] = $row;
        }
        // Return tasks as a JSON response
        echo json_encode($tasks);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'failed to fetch user tasks']);
    }
    // Close the statement and the connection
    $stmt->close();
    $conn->close();
}
elseif($_SERVER["REQUEST_METHOD"] === "PATCH"){
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    $task_id = $data["id"];
    $task_complete = $data["task_complete"];

    #
    $check_overdue = "SELECT overdue FROM tasks WHERE user_id = ? AND id = ?";
    $stmt = $conn->prepare($check_overdue);
    $stmt ->bind_param("ii", $user_id, $task_id);
    
    $overdue = 0;
    if ($stmt->execute()){
        $result = $stmt ->get_result();
        if ($row =$result->fetch_assoc()){
            $overdue = $row["overdue"];
        }
    }
    $stmt->close();
    if ($overdue ===1){
        echo json_encode(["status"=> "error", "message"=> "task completion failed to toggle, this task is overdue and cannot be moved"]);
        $conn->close();
    }

    $toggleCompleteQuery = "UPDATE tasks SET task_complete = ? WHERE user_id = ? AND id = ?";
    $stmt = $conn->prepare($toggleCompleteQuery);
    $stmt->bind_param("iii", $task_complete, $user_id, $task_id);

    if( $stmt->execute() ){
        echo json_encode(["status"=> "success","message"=> "task completion toggled"]);
    }
    else{
        echo json_encode(["status"=> "error", "message"=> "task completion failed to toggle"]);
    }
    $stmt->close();
    $conn->close();
}


