<?php
// fetch_notifications.php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include 'connect.php'; // Database connection

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    // Check if username is provided in the GET request
    if (isset($_GET['username'])) {
        $username = $_GET['username']; // Get the username from the URL

        // First, fetch the user_id based on the username
        $fetch_user_id = "SELECT id FROM users WHERE username = ?";
        $stmt = $conn->prepare($fetch_user_id);

        if (!$stmt) {
            echo json_encode(["error" => "Failed to prepare statement for user ID: " . $conn->error]);
            exit();
        }

        $stmt->bind_param("s", $username); // Bind username
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $user_id = $row['id']; // Get the user_id

            // Now, fetch notifications for this user_id, including notification ID and read status
            $fetch_notifications = "SELECT id, notification_text, is_read FROM notifications WHERE user_id = ?";
            $stmt2 = $conn->prepare($fetch_notifications);

            if (!$stmt2) {
                echo json_encode(["error" => "Failed to prepare statement for notifications: " . $conn->error]);
                exit();
            }

            $stmt2->bind_param("i", $user_id); // Bind user_id
            $stmt2->execute();
            $result2 = $stmt2->get_result();
            $notifications = array();

            while ($row2 = $result2->fetch_assoc()) {
                // Create a notification object with id, message, and read status
                $notifications[] = [
                    "id" => $row2['id'], // Add notification ID
                    "text" => $row2['notification_text'], // Use notification text as message
                    "read" => $row2['is_read'] == 1 // Convert is_read to boolean
                ];
            }

            // Return notifications as a JSON response
            echo json_encode($notifications);

            // Close the statement
            $stmt2->close();
        } else {
            echo json_encode(["error" => "User not found"]);
        }

        $stmt->close();
    } else {
        echo json_encode(["error" => "username parameter missing"]);
    }
}

// Close the database connection
$conn->close();
?>
