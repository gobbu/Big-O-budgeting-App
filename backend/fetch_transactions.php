<?php
session_start();
header('Content-Type: application/json');

// Include your connection file
include('connect.php');

// Check if user_id is set in the session
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not authenticated']);
    exit();
}

$user_id = $_SESSION['user_id'];

// SQL query to get the latest 3 transactions for the logged-in user
$sql = "SELECT whoIsPaying, whoIsGettingPaid, transactionAmount, transactionDate, transactionNote 
        FROM payments 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 3";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$transactions = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
}

// Return the transactions as JSON
echo json_encode(["status" => "success", "transactions" => $transactions]);

$stmt->close();
$conn->close();
?>