<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

// Include the database connection file
include 'connect.php'; // Ensure this file contains the mysqli connection logic

// Function to send email notifications
// function sendEmail($to, $subject, $message) {
//     // Use the PHP mail function to send emails
//     if(mail($to, $subject, $message)) {
//         echo "Email sent to $to\n";
//     } else {
//         echo "Failed to send email to $to\n";
//     }
// }

function sendEmail($to, $subject, $message) {
    if (mail($to, $subject, $message)) {
        error_log("Email sent to $to");
    } else {
        error_log("Failed to send email to $to");
    }
}


// Function to store notification in the database
function storeNotification($user_id, $notification_text, $conn) {
    $insert_notification = "INSERT INTO notifications (user_id, notification_text) VALUES (?, ?)";
    $stmt = $conn->prepare($insert_notification);
    $stmt->bind_param("is", $user_id, $notification_text);
    $stmt->execute();
    $stmt->close();
}

// Fetching the list of users to send notifications
$users_query = "SELECT id, username, email FROM users"; // Adjust this based on your actual users table
$users_result = $conn->query($users_query);

if ($users_result) {
    while ($user_row = $users_result->fetch_assoc()) {
        $user_id = $user_row['id']; // Assuming 'id' is the user's primary key
        $username = $user_row['username'];
        $user_email = $user_row['email']; // Assume you have an email column

        // Prepare the SQL query to fetch tasks due within the next day
        $fetch_due_tasks = "SELECT task_name, due_date FROM tasks WHERE username = ? AND due_date <= NOW() + INTERVAL 1 DAY AND task_complete = 0";
        $stmt_due = $conn->prepare($fetch_due_tasks);

        if ($stmt_due) {
            // Bind parameters
            $stmt_due->bind_param("s", $username);

            // Execute the query
            $stmt_due->execute();
            $result_due = $stmt_due->get_result();
            $due_tasks = $result_due->fetch_all(MYSQLI_ASSOC);

            // Send reminders for tasks due tomorrow and store notifications
            foreach ($due_tasks as $task) {
                $subject = "Task Reminder: " . $task['task_name'];
                $message = "Reminder: Your task '" . $task['task_name'] . "' is due on " . $task['due_date'];
                
                // Send email
                sendEmail($user_email, $subject, $message);

                // Store the notification
                $notification_text_due = "Reminder: Your task '" . $task['task_name'] . "' is due on " . $task['due_date'];
                storeNotification($user_id, $notification_text_due, $conn);
            }

            // Close the statement
            $stmt_due->close();
        }

        // Prepare the SQL query to fetch overdue tasks
        $fetch_overdue_tasks = "SELECT task_name FROM tasks WHERE username = ? AND due_date < NOW() AND task_complete = 0";
        $stmt_overdue = $conn->prepare($fetch_overdue_tasks);

        if ($stmt_overdue) {
            // Bind parameters
            $stmt_overdue->bind_param("s", $username);

            // Execute the query
            $stmt_overdue->execute();
            $result_overdue = $stmt_overdue->get_result();
            $overdue_tasks = $result_overdue->fetch_all(MYSQLI_ASSOC);

            // Send notifications for overdue tasks and store notifications
            foreach ($overdue_tasks as $task) {
                $subject = "Overdue Task Notification: " . $task['task_name'];
                $message = "Alert: You missed your deadline for the task '" . $task['task_name'] . "'. Please check your task list.";
                
                // Send email
                sendEmail($user_email, $subject, $message);

                // Store the notification
                $notification_text_overdue = "Alert: You missed the deadline for the task '" . $task['task_name'] . "'.";
                storeNotification($user_id, $notification_text_overdue, $conn);
            }

            // Close the statement
            $stmt_overdue->close();
        }
    }
}

// Close the connection
$conn->close();
?>
