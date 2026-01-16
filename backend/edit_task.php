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

if ($_SERVER['REQUEST_METHOD'] === 'PATCH'){
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    //what we need?
    //task id, duh
    //what we need to return
    //nothing, we're updating something
    if ($data && isset($data['id'])) {
        $editQuery = "UPDATE tasks SET task_name = ?, due_date = ?, task_notes = ? WHERE id = ? AND user_id = ?";

        $task_id = $data["id"];
        $new_task_name = $data["task_name"];
        $new_due_date = $data["due_date"];
        $new_task_notes= $data["task_notes"];

        $today_date = date("Y-m-d");

        if($new_due_date<=$today_date){
            echo json_encode(['status' => 'error', 'message' => 'Due date must be set later than today']);
            exit();
        }

        $stmt = $conn->prepare($editQuery);
        $stmt->bind_param("sssii", $new_task_name, $new_due_date, $new_task_notes, $task_id, $user_id);

        if( $stmt->execute() ){
            echo json_encode(['status'=>"success", 'message'=>'task updated successfully!']);
        }else{
            echo json_encode(['status'=> 'error', 'message'=> 'task failed to update']);
        }

        $stmt->close();
        $conn->close();
    } 
    else {
        // Invalid data received
        http_response_code(400);  // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Invalid task data']);
        $stmt->close();
        $conn->close();
    }


}
elseif($_SERVER['REQUEST_METHOD']=== "DELETE"){
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];

    //we need id, and the task_id again

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $task_id = $data["id"];

    $deleteQuery = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($deleteQuery);
    $stmt ->bind_param("ii", $task_id, $user_id);

    if( $stmt->execute() ){
        echo json_encode(['status'=>"success", 'message'=>'task deleted successfully!']);
        $stmt->close();
        $conn->close();
    }else{
        echo json_encode(['status'=> 'error', 'message'=> 'task failed to delete']);
        $stmt->close();
        $conn->close();
    }
} else {
echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
$conn->close();
}