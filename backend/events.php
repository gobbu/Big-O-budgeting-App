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

// why don't we just do this first next time?
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
    exit();
}

$user_id = $_SESSION['user_id'];
$username = $_SESSION['username'];


if ($_SERVER['REQUEST_METHOD'] === 'POST'){
//making a post requires the following:
//event name, event start, event end, event notes
    $json = file_get_contents('php://input');
    $data = json_decode($json, true); 

    //assume front end handles converting timestamp into php

    //check if the required fields are blank

    if (!isset($data['event_start']) && $data['event_end'] && $data['event_name']) {
        echo json_encode(['status' => 'error', 'message' => 'Missing details in name, start, or end']);
        $stmt->close();
        $conn->close();
    }

    $event_name = $data['event_name'];
    $event_start = date("Y-m-d H:i:s", $data['event_start']);
    $event_end = date("Y-m-d H:i:s",$data['event_end']);
    $event_notes = $data['event_notes'];
    $event_date = date('Y-m-d H:i:s', $data['event_start']);
    $event_location = $data['event_location'];

    $insertQuery = "INSERT INTO events (username, user_id, event_name, event_start, event_end, event_notes, event_date, event_location) VALUES (?,?,?,?,?,?,?,?)";
    $stmt = $conn->prepare($insertQuery);
    $stmt->bind_param("sissssss", $username, $user_id, $event_name,$event_start, $event_end, $event_notes, $event_date, $event_location);
    
    if($stmt->execute()){
        echo json_encode(['status' => 'success', 'message' => 'Event added successfully']);
        $stmt->close();
        $conn->close();
    }
    else{
        echo json_encode(['status' => 'error', 'message' => 'Event failed to be added']);
        $stmt->close();
        $conn->close();
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === 'PATCH'){
    $json = file_get_contents('php://input');
    $data = json_decode($json, true); 

    //assume front end handles converting timestamp into php

    //check if the required fields are blank

    if (!isset($data['event_start']) && $data['event_end'] && $data['event_name']) {
        echo json_encode(['status' => 'error', 'message' => 'Missing details in name, start, or end for edit']);
        $stmt->close();
        $conn->close();
    }

    $event_name = $data['event_name'];
    $event_start = date("Y-m-d H:i:s", $data['event_start']);
    $event_end = date("Y-m-d H:i:s",$data['event_end']);
    $event_notes = $data['event_notes'];
    $event_date = date('Y-m-d H:i:s', $data['event_start']);
    $event_location = $data['event_location'];

    if($data['id']){
        $editQuery ="UPDATE events SET event_name = ?, 
                                       event_start = ?, 
                                       event_end = ?, 
                                       event_notes = ?, 
                                       event_location = ?
                                    WHERE id = ? AND user_id = ?";

        $stmt = $conn->prepare($editQuery);
        $stmt -> bind_param("sssssii", $event_name, $event_start, $event_end, $event_notes, $event_location, $data['id'], $user_id );

        if( $stmt->execute() ){
            echo json_encode(['status'=>"success", 'message'=>'event updated successfully!']);
        }else{
            echo json_encode(['status'=> 'error', 'message'=> 'event failed to update']);
        }

        $stmt->close();
        $conn->close();
    } else {
        // Invalid data received
        http_response_code(400);  // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Invalid event data']);
        $stmt->close();
        $conn->close();
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE'){
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $task_id = $data["id"];

    $deleteQuery = "DELETE FROM events WHERE id = ? AND user_id = ?";
    $stmt = $conn->prepare($deleteQuery);
    $stmt ->bind_param("ii", $task_id, $user_id);

    if( $stmt->execute() ){
        echo json_encode(['status'=>"success", 'message'=>'event deleted successfully!']);
        $stmt->close();
        $conn->close();
    }else{
        echo json_encode(['status'=> 'error', 'message'=> 'event failed to delete']);
        $stmt->close();
        $conn->close();
    }
}


else{
echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
$conn->close();
}