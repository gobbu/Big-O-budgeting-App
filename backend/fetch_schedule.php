<?php

session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'connect.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
    exit();
}

$user_id = $_SESSION['user_id'];
$username = $_SESSION['username'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // Fetch events for the user
    $eventQuery = "
        SELECT 
            e.id,
            e.event_date, 
            e.event_name, 
            e.event_start, 
            e.event_end, 
            e.event_notes, 
            e.event_location
        FROM events e 
        WHERE e.user_id = ? AND e.username = ?
    ";

    $taskQuery = "
        SELECT 
            t.due_date, 
            COUNT(t.id) AS task_count
        FROM tasks t 
        WHERE t.user_id = ? 
        GROUP BY t.due_date
    ";

    $eventStmt = $conn->prepare($eventQuery);
    $taskStmt = $conn->prepare($taskQuery);

    $eventStmt->bind_param("is", $user_id, $username);
    $taskStmt->bind_param("i", $user_id);

    $schedule = [];

    // Execute the events query
    if ($eventStmt->execute()) {
        $eventResult = $eventStmt->get_result();

        while ($row = $eventResult->fetch_assoc()) {
            $date = $row['event_date'];
            $eventData = [
                'event_id' => $row['id'],
                'event_start' => strtotime($row['event_start']),
                'event_end' => strtotime($row['event_end']),
                'event_name' => $row['event_name'],
                'event_notes' => $row['event_notes'],
                'event_location' => $row['event_location']
            ];

            // Initialize date entry if it doesn't exist
            if (!isset($schedule[$date])) {
                $schedule[$date] = ['events' => [], 'tasks' => 0];
            }

            // Append event data
            $schedule[$date]['events'][] = $eventData;
        }
    }

    // Execute the tasks query
    if ($taskStmt->execute()) {
        $taskResult = $taskStmt->get_result();

        while ($row = $taskResult->fetch_assoc()) {
            $date = $row['due_date'];
            $taskCount = (int)$row['task_count'];

            // Initialize date entry if it doesn't exist
            if (!isset($schedule[$date])) {
                $schedule[$date] = ['events' => [], 'tasks' => 0];
            }

            // Update task count
            $schedule[$date]['tasks'] = $taskCount;
        }
    }

    echo json_encode(["status" => "success", "message" => $schedule]);

} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
}

$conn->close();