<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");


// Destroy the session and unset all session variables
session_unset();
session_destroy();

// Return a success message
echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
?>