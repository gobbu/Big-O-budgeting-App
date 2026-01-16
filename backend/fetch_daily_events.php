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

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
    exit();
}

if (!isset($_GET['date'])) {
    echo json_encode(['status' => 'error', 'message' => 'Date parameter is missing']);
    exit();
}

$user_id = $_SESSION['user_id'];
$date = $_GET['date'];
$dailyData = [
    "payments" => [],
    "tasks" => [],
    "work_hours" => [],
    "pay_cycles" => [],
    "pay_stubs" => []
];

// Fetch Payments Data
$paymentsQuery = "SELECT transactionDate, whoIsPaying, whoIsGettingPaid, transactionAmount, transactionNote, category FROM payments WHERE user_id = ? AND transactionDate = ?";
$stmt = $conn->prepare($paymentsQuery);
$stmt->bind_param("is", $user_id, $date);
executeAndFetchData($stmt, 'payments', $dailyData);

// Fetch Tasks Data
$tasksQuery = "SELECT due_date, task_name, task_notes FROM tasks WHERE user_id = ? AND due_date = ?";
$stmt = $conn->prepare($tasksQuery);
$stmt->bind_param("is", $user_id, $date);
executeAndFetchData($stmt, 'tasks', $dailyData);

// Fetch Work Hours Data
$workHoursQuery = "SELECT workDate, jobTitle, hoursWorked, calculatedPay FROM work_hours WHERE user_id = ? AND workDate = ?";
$stmt = $conn->prepare($workHoursQuery);
$stmt->bind_param("is", $user_id, $date);
executeAndFetchData($stmt, 'work_hours', $dailyData);

// Fetch Pay Stubs Data
$payStubsQuery = "SELECT payDate, jobTitle, totalPay FROM pay_stubs WHERE user_id = ? AND payDate = ?";
$stmt = $conn->prepare($payStubsQuery);
$stmt->bind_param("is", $user_id, $date);
executeAndFetchData($stmt, 'pay_stubs', $dailyData);

// Fetch Pay Cycles Data (Filter only by cycle start date for simplicity)
$payCyclesQuery = "SELECT jobTitle, currentRate, cycleStartDate, cycleFrequency FROM pay_cycles WHERE user_id = ? AND cycleStartDate <= ?";
$stmt = $conn->prepare($payCyclesQuery);
$stmt->bind_param("is", $user_id, $date);
executeAndFetchData($stmt, 'pay_cycles', $dailyData);

echo json_encode(["status" => "success", "data" => $dailyData]);
$conn->close();

function executeAndFetchData($stmt, $category, &$dailyData) {
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = $result->fetch_assoc()) {
            $dailyData[$category][] = formatData($category, $row);
        }
    }
}

function formatData($category, $row) {
    switch ($category) {
        case 'payments':
            return [
                'event_name' => $row['whoIsPaying'] . " paid " . $row['whoIsGettingPaid'] . " $" . $row['transactionAmount'] . " for " . $row['category'],
                'event_notes' => "Note: " . $row['transactionNote']
            ];
        case 'tasks':
            return [
                'event_name' => $row['task_name'] . " due Today",
                'event_notes' => "Note: " . $row['task_notes']
            ];
        case 'work_hours':
            return [
                'event_name' => "Worked " . $row['hoursWorked'] . " hours at " . $row['jobTitle'],
                'event_notes' => "Earnings: $" . $row['calculatedPay']
            ];
        case 'pay_stubs':
            return [
                'event_name' => $row['jobTitle'] . " paid $" . $row['totalPay'],
                'event_notes' => ''
            ];
        case 'pay_cycles':
            return [
                'event_name' => $row['cycleFrequency'] . " payment for " . $row['jobTitle'],
                'event_notes' => "Earnings: $" . $row['currentRate']
            ];
    }
    return [];
}