<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? null;
    $email = $_POST['email'] ?? null;

    if (empty($username) || empty($email)) {
        echo json_encode(['status' => 'error', 'message' => 'Username and email are required']);
        exit();
    }

    // Verify username and email in the database
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? AND email = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
        error_log("SQL Error: " . $conn->error);
        exit();
    }
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    if ($user_id) {
        // Generate a reset token and expiry time
        $token = bin2hex(random_bytes(16));  
        $expiry = date("Y-m-d H:i:s", time() + 3600); // 1-hour expiry

        // Store the reset token and expiry in the database
        $stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_expiry = ? WHERE id = ?");
        $stmt->bind_param("ssi", $token, $expiry, $user_id);
        $stmt->execute();
        $stmt->close();

        // Construct the reset link to the React app with the token as a URL parameter
        $resetLink = "https://se-prod.cse.buffalo.edu/CSE442/2024-Fall/cse-442i/build/?token=$token";

        // Send email to user
        $subject = "Password Reset Request";
        $message = "Hello $username,\n\nClick the link below to reset your password. This link will expire in 1 hour.\n\n$resetLink\n\nIf you didn't request this, please ignore this email.";
        $headers = "From: no-reply@Big-O.com\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

        if (mail($email, $subject, $message, $headers)) {
            echo json_encode(['status' => 'success', 'message' => 'An email has been sent to reset your password. Please check your email for confirmation.']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to send email.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No account found matching that username and email.']);
    }
}

$conn->close();
?>
