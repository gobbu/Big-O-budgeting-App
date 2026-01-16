<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Check if the user session is set
if (isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'success', 'message' => 'User is authenticated']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
}
?>