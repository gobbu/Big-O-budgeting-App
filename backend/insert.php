<?php
// Include the database connection
include 'connect.php';

// Check if the form was submitted via POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Collect data from the form or hardcoded values
    $username = $_POST['username'] ?? 'testuser';  // Example data or default to 'testuser'
    $password = $_POST['password'] ?? 'password123';  // Example data or default to 'password123'

    // Hash the password (in real-world applications, always hash passwords)
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare an SQL statement to insert the data into the users table
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $username, $hashed_password);

    // Execute the prepared statement
    if ($stmt->execute()) {
        echo "New user inserted successfully!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close the statement
    $stmt->close();
} else {
    echo "No data was submitted.";
}

// Close the database connection
$conn->close();
?>