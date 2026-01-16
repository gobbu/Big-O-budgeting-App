<?php
session_start();

#

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include 'connect.php';
include 'tax_calculation.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];

    // Sanitize and handle the incoming data
    $jobTitle = $data['jobTitle'] ?? null;
    $currentRate = $data['currentRate'] ?? null;
    $cycleStartDate = validateDate($data['cycleStartDate']) ? $data['cycleStartDate'] : null;
    $cycleFrequency = $data['cycleFrequency'] ?? null;
    $amountOfWeeks = $data['amountOfWeeks'] ?? 0;
    $federalTaxes = $data['federalTaxes'] ?? null;
    $state = $data['state'] ?? null;
    $other = $data['other'] ?? null;
    $totalTaxes = $data['totalTaxes'] ?? null;

    // Check for required fields
    if (empty($jobTitle) || empty($currentRate) || empty($cycleStartDate) || empty($cycleFrequency)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }
    //$finalPay = calculateFinalPay($currentRate, $totalTaxes);


    // Prepare the SQL statement with placeholders
    $stmt = $conn->prepare("INSERT INTO pay_cycles (user_id, jobTitle, currentRate, cycleStartDate, cycleFrequency, amountOfWeeks, federalTaxes, state, other, totalTaxes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement: ' . $conn->error]);
        exit();
    }
    
    // Handle NULL values explicitly in `bind_param`
    $stmt->bind_param(
        "isssssissi",
        $user_id,
        $jobTitle,
        $currentRate,
        $cycleStartDate,
        $cycleFrequency,
        $amountOfWeeks,
        $federalTaxes,
        $state,
        $other,
        $totalTaxes
    );

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Pay cycle added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add pay cycle: ' . $stmt->error]);
    }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT id, jobTitle, currentRate, cycleStartDate, cycleFrequency, amountOfWeeks, federalTaxes, state, other, totalTaxes FROM pay_cycles WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $pay_cycles = [];

    // while ($row = $result->fetch_assoc()) {
    //     $pay_cycles[] = $row;
    // }
    while ($row = $result->fetch_assoc()) {
        // Calculate tax percentage for each pay stub
        // $row['taxPercentage'] = calculateTaxPercentage($row['totalPay'], $row['totalTaxes']);
        $row['taxPercentage'] = $row['totalTaxes'];
        $pay_cycles[] = $row;
    }

    echo json_encode(['status' => 'success', 'pay_cycles' => $pay_cycles]);
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();

// Helper function to validate the date format
function validateDate($date) {
    if (empty($date) || $date === null) {
        return false;
    }
    // Check if the date matches the `YYYY-MM-DD` format
    return preg_match("/^\d{4}-\d{2}-\d{2}$/", $date);
}
?>