<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];

    $start_date = $_GET['start'];
    $end_date = $_GET['end'];

    $fetchWeeklyHours = "
        SELECT wh.jobTitle, SUM(wh.hoursWorked) as total_hours
        FROM work_hours wh
        JOIN pay_cycles pc ON wh.jobTitle = pc.jobTitle
        WHERE wh.jobTitle IN (
            SELECT jobTitle
            FROM pay_cycles
            WHERE user_id = ?
        ) AND wh.workDate >= ? AND wh.workDate <= ?
        GROUP BY wh.jobTitle
    ";

    $stmt = $conn->prepare($fetchWeeklyHours);
    $stmt->bind_param("iss", $user_id, $start_date, $end_date);
    $stmt->execute();
    $result = $stmt->get_result();

    $jobs = [];

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $jobTitle = $row['jobTitle'];
            $totalHoursForJob = $row['total_hours'];
            
            // Add job information to the dictionary
            $jobs[$jobTitle] = $totalHoursForJob;
        }

        // Return the dictionary as a JSON object
        echo json_encode($jobs);
    } else {
        // Return an empty object if no records found
        echo json_encode([]);
    }

    $stmt->close();
    $conn->close();
}
?>