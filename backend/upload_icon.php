<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include 'connect.php';
// Ensure a file was uploaded
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['icon'])) {
    $file = $_FILES['icon'];
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($file['type'], $allowedTypes)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid file type.']);
        exit;
    }
    // Validate file size (e.g., max 2MB)
    $maxFileSize = 2 * 1024 * 1024; // 2MB
    if ($file['size'] > $maxFileSize) {
        echo json_encode(['status' => 'error', 'message' => 'File size exceeds limit of 2MB.']);
        exit;
    }
    // Define a unique filename and move the file to a temporary location
    $uploadsDir = sys_get_temp_dir(); // Use temporary directory
    $filename = uniqid('icon_', true) . '.' . pathinfo($file['name'], PATHINFO_EXTENSION);
    $filePath = $uploadsDir . DIRECTORY_SEPARATOR . $filename;
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        // File successfully uploaded
        $fileUrl = "data:image/" . pathinfo($filePath, PATHINFO_EXTENSION) . ";base64," . base64_encode(file_get_contents($filePath));
        // Optionally: You can delete the temporary file after encoding
        unlink($filePath);
        echo json_encode(['status' => 'success', 'icon_url' => $fileUrl]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to upload file.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded.']);
}