<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'connect.php'; // Database connection

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents('php://input'), true);

    if (isset($input['id']) && isset($input['read'])) {
        $id = $input['id'];
        $readStatus = $input['read'] ? 1 : 0;

        // Check if the notification with the given ID exists
        $check_query = "SELECT COUNT(*) FROM notifications WHERE id = ?";
        $check_stmt = $conn->prepare($check_query);
        $check_stmt->bind_param("i", $id);
        $check_stmt->execute();
        $check_stmt->bind_result($count);
        $check_stmt->fetch();

        if ($count == 0) {
            echo json_encode(["error" => "Notification with ID $id does not exist"]);
            $check_stmt->close();
            exit();
        }

        $check_stmt->close();

        // Update the notification status in the database
        $update_query = "UPDATE notifications SET is_read = ? WHERE id = ?";
        $stmt = $conn->prepare($update_query);

        if (!$stmt) {
            echo json_encode(["error" => "Failed to prepare statement: " . $conn->error]);
            exit();
        }

        $stmt->bind_param("ii", $readStatus, $id);
        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            error_log("SQL Error: " . $stmt->error); // Log the error for debugging
            echo json_encode(["error" => "Failed to update notification: " . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(["error" => "Invalid input"]);
    }
} else {
    echo json_encode(["error" => "Invalid request method"]);
}

// Close the database connection
$conn->close();
?>
