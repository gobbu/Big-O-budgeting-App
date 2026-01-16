<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();

header("Access-Control-Allow-Origin: *");

header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");


// Include the database connection file
include 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;

    if (empty($username) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Username and password are required']);
        exit();
    }

    // Prepare the SQL query to check the user
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
        error_log("SQL Error: " . $conn->error);  // Log SQL error
        exit();
    }

    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($user_id, $hashed_password);
    $stmt->fetch();

    if ($hashed_password && password_verify($password, $hashed_password)) {

        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $username;

        echo json_encode(['status' => 'success', 'message' => 'Login successful', 'user_id' => $user_id]);

        //sets a username cookie to use for the user's taskpage access
        // setcookie("username", $username, time()+3600, "/");

    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>