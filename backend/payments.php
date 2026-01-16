<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

// Include the database connection file
include 'connect.php';

// Function to update the budget (both weekly and monthly)
function updateBudget($conn, $category, $transactionAmount, $whoIsPaying, $whoIsGettingPaid, $transactionDate) {
    // Retrieve the username from the cookie (assuming the cookie is named 'username')
    $loggedInUsername = $_COOKIE['username'];  // The username of the logged-in user

    // Fetch the user_id for the username from the database
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->bind_param("s", $loggedInUsername);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $user_id = $user['id'];  // The user_id associated with the logged-in username

    // Check if the category exists in the budgets table
    $stmt = $conn->prepare("SELECT id FROM budgets WHERE category = ?");
    $stmt->bind_param("s", $category);
    $stmt->execute();
    $categoryResult = $stmt->get_result();

    if ($categoryResult->num_rows === 0) {
        // If the category does not exist, return an error
        echo json_encode(['status' => 'error', 'message' => 'Category does not exist']);
        exit();
    }

    // Determine the start of the week and the current month from the transactionDate
    $weekStartDate = date('Y-m-d', strtotime('last Sunday', strtotime($transactionDate)));
    $monthStartDate = date('Y-m-01', strtotime($transactionDate));

    // Weekly Budget Update
    $stmt = $conn->prepare("SELECT * FROM budgets WHERE user_id = ? AND category = ? AND period = 'weekly' AND date = ?");
    $stmt->bind_param("iss", $user_id, $category, $weekStartDate);
    $stmt->execute();
    $weeklyResult = $stmt->get_result()->fetch_assoc();

    // Monthly Budget Update
    $stmt = $conn->prepare("SELECT * FROM budgets WHERE user_id = ? AND category = ? AND period = 'monthly' AND date = ?");
    $stmt->bind_param("iss", $user_id, $category, $monthStartDate);
    $stmt->execute();
    $monthlyResult = $stmt->get_result()->fetch_assoc();

    // Logic for spending increase or decrease based on whoIsPaying and whoIsGettingPaid
    if ($whoIsPaying === $loggedInUsername) {
        $newAmount = $transactionAmount; // Increase spending if the logged-in user is paying
    } 
    // elseif ($whoIsGettingPaid === $loggedInUsername) {
    //     $newAmount = -$transactionAmount; // Decrease spending if the logged-in user is receiving payment
    // } 
    // else {
    //     // If neither is the logged-in user, return an error
    //     echo json_encode(['status' => 'error', 'message' => 'You are not authorized to perform this action']);
    //     exit();
    // }

    // Update Weekly Budget
    if ($weeklyResult) {
        // Update the weekly budget with the new spending amount
        $newWeeklyAmount = $weeklyResult['spent'] + $newAmount;
        $stmt = $conn->prepare("UPDATE budgets SET spent = ? WHERE user_id = ? AND category = ? AND period = 'weekly' AND date = ?");
        $stmt->bind_param("diss", $newWeeklyAmount, $user_id, $category, $weekStartDate);
        $stmt->execute();
    } 
    // else {
    //     // If there is no entry for the weekly budget, create a new one
    //     $stmt = $conn->prepare("INSERT INTO budgets (user_id, category, period, spent, date) VALUES (?, ?, 'weekly', ?, ?)");
    //     $stmt->bind_param("isds", $user_id, $category, $newAmount, $weekStartDate);
    //     $stmt->execute();
    // }

    // Update Monthly Budget
    if ($monthlyResult) {
        // Update the monthly budget with the new spending amount
        $newMonthlyAmount = $monthlyResult['spent'] + $newAmount;
        $stmt = $conn->prepare("UPDATE budgets SET spent = ? WHERE user_id = ? AND category = ? AND period = 'monthly' AND date = ?");
        $stmt->bind_param("diss", $newMonthlyAmount, $user_id, $category, $monthStartDate);
        $stmt->execute();
    } 
    // else {
    //     // If there is no entry for the monthly budget, create a new one
    //     $stmt = $conn->prepare("INSERT INTO budgets (user_id, category, period, spent, date) VALUES (?, ?, 'monthly', ?, ?)");
    //     $stmt->bind_param("isds", $user_id, $category, $newAmount, $monthStartDate);
    //     $stmt->execute();
    // }

    // Return a proper JSON response
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'Updated successfully']);
    exit(); // Ensure no further output is sent
}







if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    // Get the raw POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate incoming data
    $type = $data['type'] ?? null;
    $transactionAmount = $data['transactionAmount'] ?? null;
    $transactionDate = $data['transactionDate'] ?? null;
    $whoIsPaying = $data['whoIsPaying'] ?? null;
    $whoIsGettingPaid = $data['whoIsGettingPaid'] ?? null;
    $state = $data['state'] ?? null;  // Capture the state field from the data
    $category = $data['category'] ?? null;  // Capture the category field from the data

    // Basic validation
    if (empty($transactionAmount) || empty($transactionDate) || empty($category)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }

    // Prepare the SQL statement to insert the new payment, including state and category
    $stmt = $conn->prepare("INSERT INTO payments (user_id, type, whoIsPaying, whoIsGettingPaid, transactionAmount, transactionDate, transactionNote, state, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
        error_log("SQL Error: " . $conn->error);  // Log SQL error
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $transactionNote = $data['transactionNote'] ?? '';

    // Bind the parameters, including category
    $stmt->bind_param("issssssss", $user_id, $type, $whoIsPaying, $whoIsGettingPaid, $transactionAmount, $transactionDate, $transactionNote, $state, $category);

    if ($stmt->execute()) {
        // Update the budget (both weekly and monthly)
        updateBudget($conn, $category, $transactionAmount, $whoIsPaying, $whoIsGettingPaid, $transactionDate);

    
        echo json_encode(['status' => 'success', 'message' => 'Payment added successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to add payment: ' . $stmt->error]);
    }
    

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    // Modify the SQL query to include the category field
    $stmt = $conn->prepare("SELECT id, type, whoIsPaying, whoIsGettingPaid, transactionAmount, transactionDate, transactionNote, state, category FROM payments WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();

    $result = $stmt->get_result();
    $payments = [];

    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }

    echo json_encode(['status' => 'success', 'payments' => $payments]);
    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Handle PUT requests (updating a transaction)
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    // Get the raw PUT data
    $data = json_decode(file_get_contents('php://input'), true);

    // Retrieve transaction details from request
    $payment_id = $data['id'] ?? null;
    $type = $data['type'] ?? null;
    $transactionAmount = $data['transactionAmount'] ?? null;
    $transactionDate = $data['transactionDate'] ?? null;
    $whoIsPaying = $data['whoIsPaying'] ?? null;
    $whoIsGettingPaid = $data['whoIsGettingPaid'] ?? null;
    $state = $data['state'] ?? null;
    $transactionNote = $data['transactionNote'] ?? '';
    $category = $data['category'] ?? null;  // Capture the category field from the request

    // Validate data
    if (empty($transactionAmount) || empty($transactionDate) || empty($category)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }

    // Prepare SQL statement for updating the transaction
    $stmt = $conn->prepare("UPDATE payments SET type = ?, whoIsPaying = ?, whoIsGettingPaid = ?, transactionAmount = ?, transactionDate = ?, transactionNote = ?, state = ?, category = ? WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
        error_log("SQL Error: " . $conn->error);  // Log SQL error
        exit();
    }

    // Bind parameters for the update statement
    $stmt->bind_param("sssssssssi", $type, $whoIsPaying, $whoIsGettingPaid, $transactionAmount, $transactionDate, $transactionNote, $state, $category, $payment_id, $_SESSION['user_id']);

    // if ($stmt->execute()) {
    //     // Update the budget after the payment update
    //     updateBudget($conn, $category, $transactionAmount, $whoIsPaying, $whoIsGettingPaid, $transactionDate);


    //     echo json_encode(['status' => 'success', 'message' => 'Payment updated successfully']);
    // } else {
    //     echo json_encode(['status' => 'error', 'message' => 'Failed to update payment: ' . $stmt->error]);
    // }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if the user is authenticated
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    // Get the raw DELETE data (the ID of the payment to be deleted)
    $data = json_decode(file_get_contents('php://input'), true);
    $payment_id = $data['id'] ?? null;

    if (!$payment_id) {
        echo json_encode(['status' => 'error', 'message' => 'Payment ID is required']);
        exit();
    }

    // Prepare the SQL statement to delete the payment
    $stmt = $conn->prepare("DELETE FROM payments WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
        error_log("SQL Error: " . $conn->error);  // Log SQL error
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $stmt->bind_param("ii", $payment_id, $user_id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Payment deleted successfully']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete payment: ' . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
