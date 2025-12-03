<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false]);
    exit;
}

require_once __DIR__ . '/db.php';

$id = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT name, email, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(['success' => false]);
    exit;
}

echo json_encode(['success' => true, 'data' => $res->fetch_assoc()]);
exit;
?>
