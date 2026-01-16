<?php
session_start();
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

//this is the add_task file 
include 'connect.php';

    if ($_SERVER["REQUEST_METHOD"] === 'POST') {
        
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
            exit();
        }
        $user_id = $_SESSION['user_id'];
        $username = $_SESSION['username'] ;
        
        $json = file_get_contents('php://input');
        $data = json_decode($json, true); 
        $task_name = $data['task_name'];
        $due_date = $data['due_date'];
        $task_notes = $data['task_notes'];
        $task_complete = $data['task_complete'];

        $today_date = date("Y-m-d");

        if($due_date<=$today_date){
            echo json_encode(['status' => 'error', 'message' => 'Due date must be set later than today']);
            $conn->close();
            exit();
        }

        // $table_name = "{$username}_task_table";

        $stmt = $conn->prepare("INSERT INTO tasks (username, user_id, task_name, due_date, task_notes, task_complete) VALUES (?, ?, ?,?,?, ?)");

        $stmt->bind_param("sisssi", $username, $user_id, $task_name, $due_date, $task_notes, $task_complete);

        if($stmt->execute()){
            echo json_encode(['status' => 'success', 'message' => 'Task added successfully']);
        }
        else{
            echo json_encode(['status' => 'error', 'message' => 'Task failed to be added']);
        }
    }



$conn->close();
?> 