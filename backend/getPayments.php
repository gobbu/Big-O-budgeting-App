<?php
header('Content-Type: application/json');
include 'connect.php';

$query = "SELECT id, type, amount, date FROM transactions UNION ALL SELECT id, 'Pay Cycle' as type, totalPay as amount, cycleEndDate as date FROM paycycles UNION ALL SELECT id, 'Pay Stub' as type, totalPay as amount, payDate as date FROM paystubs ORDER BY date DESC";
$result = $conn->query($query);

if ($result) {
    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }
    echo json_encode(['status' => 'success', 'payments' => $payments]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch payments.']);
}

$conn->close();
?>