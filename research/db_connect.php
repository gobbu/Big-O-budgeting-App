<?php
$servername = "localhost";
$username = "ryancao";  // Replace with your UBIT name
$password = "50396677"; // Replace with your UB number
$dbname = "ryancao_db"; // DB names for each local testing on aptitude will be different

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
?>
