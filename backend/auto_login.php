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
    if (empty($token)) {
        echo json_encode(['status' => 'error', 'message' => 'Token is required']);
        exit();
    }
    // Validate the reset token
    $stmt = $conn->prepare("SELECT id, username FROM users WHERE reset_token = ? AND reset_expiry > NOW()");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
        exit();
    }
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $stmt->bind_result($user_id, $username);
    $stmt->fetch();
    $stmt->close();
    if ($user_id) {
        session_start();
        $_SESSION['user_id'] = $user_id;
        setcookie('username', $username, time() + (86400 * 30), "/");
        echo json_encode(['status' => 'success', 'username' => $username]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token']);
    }
}
$conn->close();
?>