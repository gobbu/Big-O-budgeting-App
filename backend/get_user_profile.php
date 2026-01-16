<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Include the database connection file
include 'connect.php';

// Check if the user session is set
if (isset($_SESSION['user_id'])) {
    // User is authenticated; retrieve their information
    $userId = $_SESSION['user_id'];
    $username = $_SESSION['username']; // Get the username from the session

    // Prepare the response
    echo json_encode([
        'status' => 'success',
        'user' => [
            'id' => $userId,
            'username' => $username
        ]
    ]);
} else {
    // If the user is not logged in
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
}
?>
