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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];

    // Retrieve data from request
    $id = $data['id'] ?? null;
    $category = $data['category'] ?? null;
    $spent = $data['spent'] ?? null;
    $limit = $data['limit'] ?? null;
    $icon = $data['icon'] ?? null;

    $period = $data['period'] ?? null;
    $date = $data['date'] ?? null;
    $start_date = $data['start_date'] ?? null;
    $end_date = $data['end_date'] ?? null;

    // Check for required fields
    if (empty($category) || $spent === null || $limit === null || empty($period) || empty($icon)) {

        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        exit();
    }


    // Ensure dates are in 'YYYY-MM-DD' format
    if ($date) {
        $date = date('Y-m-d', strtotime($date));
    }
    if ($start_date) {
        $start_date = date('Y-m-d', strtotime($start_date));

    }
    if ($end_date) {
        $end_date = date('Y-m-d', strtotime($end_date));
    }

    if ($period === 'monthly') {
        if (empty($start_date) || empty($end_date)) {
            echo json_encode(['status' => 'error', 'message' => 'Start and end dates are required for monthly period']);
            exit();
        }

        // Update all entries for the category within the date range, regardless of period
        $stmt = $conn->prepare("UPDATE budgets SET spent = ?, limit_amount = ?, icon = ? WHERE user_id = ? AND category = ? AND date >= ? AND date <= ?");
        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare UPDATE statement: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param("ddsisss", $spent, $limit, $icon, $user_id, $category, $start_date, $end_date);

        // Execute the statement and check for errors
        if ($stmt->execute()) {
            if ($stmt->affected_rows === 0) {
                // No existing entries, insert a new one
                $insertStmt = $conn->prepare("INSERT INTO budgets (user_id, category, period, spent, limit_amount, icon, date) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if (!$insertStmt) {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to prepare INSERT statement: ' . $conn->error]);
                    exit();
                }
                // Use the start_date as the date for the new entry
                $insertStmt->bind_param("issdsss", $user_id, $category, $period, $spent, $limit, $icon, $start_date);
                if ($insertStmt->execute()) {
                    echo json_encode(['status' => 'success', 'message' => 'Budget saved successfully']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to insert budget: ' . $insertStmt->error]);
                }
                $insertStmt->close();
            } else {
                echo json_encode(['status' => 'success', 'message' => 'Budget updated successfully']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to update budget: ' . $stmt->error]);
        }

        $stmt->close();

    } else {
        // For weekly period
        if (empty($date)) {
            echo json_encode(['status' => 'error', 'message' => 'Date is required for weekly period']);
            exit();
        }

        // Ensure date is in 'YYYY-MM-DD' format
        $date = date('Y-m-d', strtotime($date));

        if ($id) {
            // Update the specific weekly entry
            $stmt = $conn->prepare("UPDATE budgets SET category = ?, spent = ?, limit_amount = ?, icon = ?, period = ?, date = ? WHERE id = ? AND user_id = ?");
            if (!$stmt) {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare UPDATE statement: ' . $conn->error]);
                exit();
            }
            $stmt->bind_param("sddsssii", $category, $spent, $limit, $icon, $period, $date, $id, $user_id);

            if ($stmt->execute()) {
                if ($stmt->affected_rows === 0) {
                    echo json_encode(['status' => 'error', 'message' => 'No matching budget entry found to update']);
                } else {
                    echo json_encode(['status' => 'success', 'message' => 'Budget updated successfully']);
                }
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update budget: ' . $stmt->error]);
            }
            $stmt->close();

        } else {
            // Insert new entry
            $stmt = $conn->prepare("INSERT INTO budgets (user_id, category, period, spent, limit_amount, icon, date) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if (!$stmt) {
                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare INSERT statement: ' . $conn->error]);
                exit();
            }
            $stmt->bind_param("issdsss", $user_id, $category, $period, $spent, $limit, $icon, $date);

            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'message' => 'Budget saved successfully']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Failed to save budget: ' . $stmt->error]);
            }
            $stmt->close();
        }
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $period = $_GET['period'] ?? null;
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;

    // Validate input parameters
    if (empty($period)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters provided']);
        exit();
    }

    if (empty($start_date) || empty($end_date)) {
        echo json_encode(['status' => 'error', 'message' => 'Missing start or end date']);
        exit();
    }

    // Ensure dates are in 'YYYY-MM-DD' format
    $start_date = date('Y-m-d', strtotime($start_date));
    $end_date = date('Y-m-d', strtotime($end_date));

    if ($period === 'weekly') {
        // Fetch budgets for the weekly period
        $stmt = $conn->prepare("SELECT id, category, spent, limit_amount, icon, date FROM budgets WHERE user_id = ? AND period = ? AND date >= ? AND date <= ?");
        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare SELECT statement: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param("isss", $user_id, $period, $start_date, $end_date);

        // Execute the query and build the response
        $stmt->execute();
        $result = $stmt->get_result();
        $budgets = [];

        while ($row = $result->fetch_assoc()) {
            $budgets[] = [
                "id" => $row['id'],
                "category" => $row['category'],
                "spent" => $row['spent'],
                "limit" => $row['limit_amount'],
                "icon" => $row['icon'],
                "date" => $row['date']
            ];
        }

        echo json_encode(['status' => 'success', 'budgets' => $budgets]);
        $stmt->close();

    } elseif ($period === 'monthly') {
        // Fetch aggregated monthly budgets
        $stmt = $conn->prepare("
            SELECT category, icon, SUM(spent) as total_spent, SUM(limit_amount) as total_limit
            FROM budgets
            WHERE user_id = ? AND date >= ? AND date <= ?
            GROUP BY category, icon
        ");

        if (!$stmt) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to prepare SELECT statement: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param("iss", $user_id, $start_date, $end_date);

        // Execute the query and build the response
        $stmt->execute();
        $result = $stmt->get_result();
        $budgets = [];

        while ($row = $result->fetch_assoc()) {
            $budgets[] = [
                "category" => $row['category'],
                "spent" => $row['total_spent'],
                "limit" => $row['total_limit'],
                "icon" => $row['icon']
            ];
        }

        echo json_encode(['status' => 'success', 'budgets' => $budgets]);
        $stmt->close();

    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid period specified']);
        exit();
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>
