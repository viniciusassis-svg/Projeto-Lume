<?php
header('Content-Type: application/json; charset=utf-8');
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents("php://input"), true);

$name = $input['name'] ?? null;
$monthly = $input['monthlyConsumption'] ?? null;
$user_id = $_SESSION['user_id'];

if (!$name || !$monthly) {
    echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO appliances (name, monthly_consumption, user_id) VALUES (?, ?, ?)");
$stmt->bind_param("sdi", $name, $monthly, $user_id);
$stmt->execute();

echo json_encode([
    'success' => true,
    'id' => $stmt->insert_id
]);
?>
