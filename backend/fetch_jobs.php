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

if($_SERVER['REQUEST_METHOD'] === 'GET'){

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];

    # look in the "pay_cycles" table

    $fetchJobList = "SELECT jobTitle FROM pay_cycles WHERE user_id = ?";
    $stmt = $conn->prepare($fetchJobList);
    $stmt -> bind_param("i", $user_id);
    $stmt -> execute();
    $result = $stmt->get_result();

    $jobs=array();
    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            $jobs[] = $row;
        }
        echo json_encode($jobs);
    } else{
        echo json_encode(["You currently have no jobs added"]);
    }
    $stmt->close();
    $result->close();
    $conn->close();
}