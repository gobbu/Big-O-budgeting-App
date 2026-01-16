<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

include 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];

    // Retrieve data from request
    $category = $data['category'] ?? null;
    $period = $data['period'] ?? null;
    $start_date = $data['start_date'] ?? null;
    $end_date = $data['end_date'] ?? null;

    //log incoming data for debugging 
    error_log("Deleting category: {$category}, Start: {$start_date}, End: {$end_date}");


    if (empty($category) || empty($period)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }

    if (empty($start_date) || empty($end_date)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing start or end date for deletion']);
        exit();
    }

    // Delete all entries for the category within the date range
    $stmt = $conn->prepare("DELETE FROM budgets WHERE user_id = ? AND category = ? AND date >= ? AND date <= ?");
    $stmt->bind_param("isss", $user_id, $category, $start_date, $end_date);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Category deleted successfully']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Category not found']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete category: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
