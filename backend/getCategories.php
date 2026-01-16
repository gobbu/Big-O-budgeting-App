<?php
header("Content-Type: application/json");
include 'connect.php';

session_start();  // Ensure the session is started

// Check if the user is authenticated
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "error", "message" => "User not authenticated"]);
    exit();
}

$user_id = $_SESSION['user_id'];  // Retrieve the user ID from session

try {
    // Ensure the `user_id` is numeric and valid
    if (!is_numeric($user_id)) {
        throw new Exception("Invalid user ID");
    }

    // Prepare the SQL query to fetch categories for the user
    $query = "SELECT id, category, period FROM budgets WHERE user_id = ?";
    $stmt = $conn->prepare($query);

    // Bind the `user_id` parameter to the query
    $stmt->bind_param("i", $user_id);

    // Execute the prepared statement
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if categories were found
    if ($result->num_rows == 0) {
        throw new Exception("No categories found for the specified user.");
    }

    $categories = [];

    // Fetch each row and modify the `name` to include `period`
    while ($row = $result->fetch_assoc()) {
        $row['name'] = $row['category'] . " (" . ucfirst($row['period']) . ")";
        $categories[] = $row;
    }

    echo json_encode(["status" => "success", "categories" => $categories]);

} catch (Exception $e) {
    // Return an error message if something goes wrong
    echo json_encode([
        "status" => "error",
        "message" => "Error fetching categories",
        "details" => $e->getMessage()
    ]);
}
?>
