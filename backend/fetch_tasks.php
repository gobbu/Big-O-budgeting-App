<?php
// fetch_tasks.php

// Include the database connection
include 'connect.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['due_date'])) {
        echo json_encode(['error' => 'Due date is required']);
        exit;
    }

    $due_date = $_GET['due_date'];
    $user_id = $_SESSION['user_id']; // Assuming the user is logged in and user_id is stored in session

    try {
        // Query to count tasks for the specified date
        $query = "SELECT COUNT(*) AS task_count FROM tasks WHERE user_id = ? AND due_date = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$user_id, $due_date]);
        
        // Fetch the task count
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $taskCount = $result ? (int)$result['task_count'] : 0;

        echo json_encode(['task_count' => $taskCount]);
    } catch (PDOException $e) {
        echo json_encode(['error' => 'Failed to fetch task count: ' . $e->getMessage()]);
    }
}
?>