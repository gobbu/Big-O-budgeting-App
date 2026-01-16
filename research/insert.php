<?php

header("Access-Control-Allow-Origin: *");  // Allow all domains, or set a specific domain
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include 'db_connect.php';

// Set the funny_number value from POST request, or use a default value (like 420)
$funny_number = isset($_POST['funny_number']) ? $_POST['funny_number'] : 420;

// Get the table name from the POST request or use a default value
$table_name = isset($_POST['table_name']) ? $_POST['table_name'] : 'test';

// Sanitize the table name to prevent SQL injection
$table_name = preg_replace('/[^a-zA-Z0-9_]/', '', $table_name);

// Check if the table exists
$sql_check_table = "SHOW TABLES LIKE '$table_name'";
$result_table = $conn->query($sql_check_table);

if ($result_table->num_rows > 0) {
    // If the table exists, proceed with the insert/update operation

    // Check if the funny_number already exists in the table
    $sql_check = "SELECT funny_count FROM $table_name WHERE funny_number = $funny_number";
    $result = mysqli_query($conn, $sql_check);

    if (mysqli_num_rows($result) > 0) {
        // If the number exists, increment the funny_count
        $row = mysqli_fetch_assoc($result);
        $new_count = $row['funny_count'] + 1;

        $sql_update = "UPDATE $table_name SET funny_count = $new_count WHERE funny_number = $funny_number";

        if (mysqli_query($conn, $sql_update)) {
            echo "Funny number $funny_number count incremented to $new_count in table '$table_name'.";
        } else {
            echo "Error updating record: " . mysqli_error($conn);
        }
    } else {
        // If the number does not exist, insert it with funny_count = 1
        $sql_insert = "INSERT INTO $table_name (funny_number, funny_count) VALUES ($funny_number, 1)";

        if (mysqli_query($conn, $sql_insert)) {
            echo "New record created successfully for funny number: $funny_number in table '$table_name'.";
        } else {
            echo "Error: " . $sql_insert . "<br>" . mysqli_error($conn);
        }
    }
} else {
    echo "Table '$table_name' does not exist.";
}

mysqli_close($conn);
?>
