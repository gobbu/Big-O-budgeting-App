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
include 'tax_calculation.php'; // Include the tax calculation file

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    // Retrieve and sanitize input fields
    $user_id = $_SESSION['user_id'];
    $jobTitle = $data['jobTitle'] ?? null;
    $hoursWorked = $data['hoursWorked'] ?? 0;
    $currentRate = $data['currentRate'] ?? 0.0;
    $totalPay = $data['totalPay'] ?? 0.0;
    $payDate = $data['payDate'] ?? 'N/A';
    $federalTaxes = $data['federalTaxes'] ?? 0.0;
    $state = $data['state'] ?? '';
    $other = $data['other'] ?? 0.0;
    $totalTaxes = $data['totalTaxes'] ?? 0.0;

    // Check required fields
    if (empty($jobTitle)) {
        echo json_encode(['status' => 'error', 'message' => 'Job Title is required']);
        exit();
    }

    // Insert pay stub into the database
    $stmt = $conn->prepare("INSERT INTO pay_stubs (user_id, jobTitle, hoursWorked, currentRate, totalPay, payDate, federalTaxes, state, other, totalTaxes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement: ' . $conn->error]);
        error_log("SQL Error: " . $conn->error);
        exit();
    }

    // Calculate the tax percentage
    $taxPercentage = calculateTaxPercentage($totalPay, $totalTaxes);

    $stmt->bind_param(
        "isddssdssd",
        $user_id,
        $jobTitle,
        $hoursWorked,
        $currentRate,
        $totalPay,
        $payDate,
        $federalTaxes,
        $state,
        $other,
        $totalTaxes
    );

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Pay stub added successfully', 'taxPercentage' => $taxPercentage]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add pay stub: ' . $stmt->error]);
    }

    $stmt->close();
}

// Handle GET request
elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT id, jobTitle, hoursWorked, currentRate, totalPay, payDate, federalTaxes, state, other, totalTaxes FROM pay_stubs WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $pay_stubs = [];

    while ($row = $result->fetch_assoc()) {
        // Calculate tax percentage for each pay stub
        // $row['taxPercentage'] = calculateTaxPercentage($row['totalPay'], $row['totalTaxes']);
        $row['taxPercentage'] = $row['totalTaxes'];
        $pay_stubs[] = $row;
    }

    echo json_encode(['status' => 'success', 'pay_stubs' => $pay_stubs]);
    $stmt->close();
}

// Invalid request method
else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
