<?php

header("Access-Control-Allow-Origin: *");  // Allow all domains, or set a specific domain
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

// Check if a table name is provided via POST, or use a default name
$table_name = isset($_POST['table_name']) ? $_POST['table_name'] : 'test';

// Sanitize table name (you might want to make this more restrictive in a real-world application)
$table_name = preg_replace('/[^a-zA-Z0-9_]/', '', $table_name);  // Allow only alphanumeric characters and underscores

// Check if the table already exists
$sql_check_table = "SHOW TABLES LIKE '$table_name'";
$result = $conn->query($sql_check_table);

if ($result->num_rows > 0) {
    // Table exists
    echo "Table '$table_name' already exists.";
} else {
    // Table does not exist, create the table
    $sql = "CREATE TABLE $table_name (
        id INT AUTO_INCREMENT PRIMARY KEY,
        funny_number INT NOT NULL,
        funny_count INT DEFAULT 1
    )";

    if ($conn->query($sql) === TRUE) {
        echo "Table '$table_name' created successfully.";
    } else {
        echo "Error creating table: " . $conn->error;
    }
}

$conn->close();
?>
