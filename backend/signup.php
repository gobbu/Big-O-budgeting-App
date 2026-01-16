<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Include the database connection file
include 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve the POST data for username, password, and email
    $username = $_POST['username'] ?? null;
    $password = $_POST['password'] ?? null;
    $email = $_POST['email'] ?? null; // New email field

    // Validate inputs
    if (empty($username) || empty($password) || empty($email)) {
        echo json_encode(['status' => 'error', 'message' => 'Username, password, and email are required']);
        exit();
    }

    // Password validation
    if (
        strlen($password) < 8 || // At least 8 characters
        !preg_match('/[A-Z]/', $password) || // At least one uppercase letter
        !preg_match('/[a-z]/', $password) || // At least one lowercase letter
        !preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password) || // At least one special character
        !preg_match('/\d/', $password) // At least one number
    ) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Password must contain at least one capital letter, one special character, and one number.',
        ]);
        exit();
    }

    // Check for duplicate email or username
    $checkDupe = "SELECT * FROM users WHERE email = ? OR username = ?";
    $stmt = $conn->prepare($checkDupe);
    $stmt->bind_param("ss", $email, $username);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            echo json_encode(['status' => 'error', 'message' => 'Signup failed. Email or username might already exist.']);
            exit();
        }
    }

    // Hash the password before storing it in the database
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare the SQL statement to insert a new user with username, password, and email
    $stmt = $conn->prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $hashed_password, $email);

    // Execute the statement and send a response based on success or failure
    if ($stmt->execute()) {
        $_SESSION["user_id"] = $stmt->insert_id;
        $_SESSION['username'] = $username;
        echo json_encode(["status" => "success", "message" => "Signup successful"]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Signup failed. Please try again later.']);
    }

    // Close the statement
    $stmt->close();
}
// Close the database connection
$conn->close();
?>