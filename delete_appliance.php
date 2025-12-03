<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

require_once "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? 0;

$query = $conn->prepare("DELETE FROM appliances WHERE id = ? AND user_id = ?");
$query->bind_param("ii", $id, $_SESSION['user_id']);
$query->execute();

echo json_encode(['success' => true]);
?>
