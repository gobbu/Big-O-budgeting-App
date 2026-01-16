<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? null; 
    $new_password = $_POST['new_password'] ?? null;
    $confirm_password = $_POST['confirm_password'] ?? null;

    if (empty($token) || empty($new_password) || empty($confirm_password)) {
        echo json_encode(['status' => 'error', 'message' => 'Token and both password fields are required']);
        exit();
    }

    if ($new_password !== $confirm_password) {
        echo json_encode(['status' => 'error', 'message' => 'Passwords do not match']);
        exit();
    }



    // Check if token is valid and not expired
    $stmt = $conn->prepare("SELECT id FROM users WHERE reset_token = ? AND reset_expiry > NOW()");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
        error_log("SQL Error: " . $conn->error);
        exit();
    }
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    if ($user_id) {
        // Update password and clear the reset token
        $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?");
        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare password update statement']);
            error_log("SQL Error: " . $conn->error);
            exit();
        }
        $stmt->bind_param("si", $hashed_password, $user_id);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success', 'message' => 'Your password has been successfully reset.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to reset password. Please try again.']);
            error_log("SQL Error: " . $stmt->error);
        }
        $stmt->close();
    } else {
        echo json_encode(['status' => 'error', 'message' => 'This password reset link has expired or is invalid.']);
    }
}

$conn->close();
?>
