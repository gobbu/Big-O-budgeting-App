<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Check if the user is authenticated
if (isset($_SESSION['user_id'])) {
    // User is authenticated, return the welcome message and user details
    echo json_encode([
        'status' => 'success',
        'message' => 'Welcome to the Home Page',
        'username' => $_SESSION['username']
    ]);
} else {
    // User is not authenticated, send an error response
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated. Please log in.']);
}
?>