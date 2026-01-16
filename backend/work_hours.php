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
include 'tax_calculation.php';
// result: adding work hours to the work_hours table
// post req
if ($_SERVER['REQUEST_METHOD'] === 'POST'){

    // user inputs: date, job name, hours worked
    // user_id from SESSION
    if(!isset($_SESSION['user_id'])){
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $user_id = $_SESSION['user_id'];
    $jobTitle = $data['jobTitle'] ?? null;
    $workDate = $data['workDate'] ?? null;
    $hoursWorked = $data['hoursWorked'] ?? 0;

    if ($jobTitle === null || $workDate === null){
        echo json_encode(['status'=> 'error','message'=>'missing date or job title']);
        exit();
    }


    // need: figure out wages 
    // requires: hourly rate, deducted taxes method
    
    //find hourly rate from the pay_cycles table...
    $hourlyRateQuery = "SELECT currentRate FROM pay_cycles WHERE jobTitle = ? AND user_id = ?";
    $stmt = $conn->prepare($hourlyRateQuery);
    $stmt ->bind_param('si', $jobTitle, $user_id);
    $stmt -> execute();
    $result = $stmt->get_result();
    $hourlyRate = 0;

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $hourlyRate = $row["currentRate"];
        echo json_encode(["status" => "success", "message" => "Hourly rate found"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to find hourly rate"]);
        exit();
    }

    // find the total taxes from the pay_cycles table...
    $totalTaxQuery = "SELECT totalTaxes FROM pay_cycles WHERE jobTitle = ? AND user_id = ?";
    $stmt = $conn->prepare($totalTaxQuery);
    $stmt ->bind_param('si', $jobTitle, $user_id);
    $stmt -> execute();
    $result = $stmt->get_result();
    $totalTax = 0;

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $totalTax = $row["totalTaxes"];
        echo json_encode(["status" => "success", "message" => "Total tax found"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to find total tax"]);
        exit();
    }

    
    //$estimatedWages = $hourlyRate * $hoursWorked;
    $wage_beofre_tax = $hourlyRate * $hoursWorked;
    $tax = $wage_beofre_tax * ($totalTax / 100);
    $wage_after_tax = $wage_beofre_tax - $tax;

    // call the calculate wages function here, and plug in estimated total and tax total

    
    $calculatedPay=$wage_after_tax;



    // insert this information into the table "work_hours"
    $insertWorkHours = "INSERT INTO work_hours (user_id, jobTitle, workDate, hoursWorked, calculatedPay) 
                        VALUES (?,?,?,?,?)";
    $stmt = $conn->prepare($insertWorkHours);
    $stmt ->bind_param("issdd",
                        $user_id,
                        $jobTitle,
                        $workDate,
                        $hoursWorked,
                        $calculatedPay
                    );
    if($stmt->execute()){
        echo json_encode(["status"=> "success","message"=> "workhours logged"]);
        
    } else {
        echo json_encode(["status"=> "error","message"=> "workhours failed to record"]);
    }
$stmt->close();           
$conn->close();
}


// result: returning the work hours and the total pay to the front end
// get req
elseif($_SERVER['REQUEST_METHOD'] === 'GET'){

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'User is not authenticated']);
        exit();
    }
    $user_id = $_SESSION['user_id'];
    
    //site inputs: date 
    if (!isset($_GET['date'])) {
        echo json_encode(['status' => 'error', 'message' => 'Date is required']);
        exit;
    }

    // assuming that work date is sent as YYYYMMDD
    $workDate = htmlspecialchars($_GET['date']);

    //returns: total hours and total cash earned that day from table "work_hours" 
    $totalHours = 0;
    $totalPayment = 0;

    //we can find one particular day's work hours and payments by looking at the work_hours table's calculatedPay and hoursWorked fields
    //requirements: user_id, workDate

    $extractHoursAndPayments = "SELECT calculatedPay, hoursWorked 
                                FROM work_hours 
                                WHERE user_id = ? AND workDate = ? ";
    $stmt = $conn->prepare($extractHoursAndPayments);
    $stmt ->bind_param("is", $user_id, $workDate);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows>0){
        for ($i = 0; $i<$result->num_rows; $i++){
            $row = $result->fetch_assoc();
            $totalHours += $row["hoursWorked"];
            $totalPayment += $row["calculatedPay"];
        }
        echo json_encode(["hoursWorked"=>$totalHours, "dayPayment"=>$totalPayment]);
        
    }
    else{
        echo json_encode(["hoursWorked"=> 0, "dayPayment"=> 0]);
    }
    $result -> close();
    $conn->close();
}
