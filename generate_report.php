<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Não autenticado']);
    exit;
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);

$solar_generated = isset($input['solar_generated']) ? (float)$input['solar_generated'] : 0.0;
$month_year = $input['month_year'] ?? null;

if (!$month_year) {
    echo json_encode(['success' => false, 'error' => 'Mês inválido']);
    exit;
}

$user_id = intval($_SESSION['user_id']);

$sql = "SELECT COALESCE(SUM(monthly_consumption),0) AS total_kwh FROM appliances WHERE user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $user_id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$total_kwh = (float)$row['total_kwh'];
$stmt->close();

$tariff = 0.8;
$co2Factor = 0.233;

$total_cost = $total_kwh * $tariff;
$total_co2 = $total_kwh * $co2Factor;

$usable = min($solar_generated, $total_kwh);
$solar_savings = $usable * $tariff;
$solar_co2_saved = $usable * $co2Factor;

$check = $conn->prepare("SELECT id FROM monthly_reports WHERE user_id = ? AND month_year = ?");
$check->bind_param('is', $user_id, $month_year);
$check->execute();

$result = $check->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Já existe relatório para este mês.']);
    exit;
}

$ins = $conn->prepare("INSERT INTO monthly_reports 
    (user_id, month_year, total_kwh, total_cost, total_co2, solar_generated, solar_savings, solar_co2_saved) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

$ins->bind_param(
    'isdidddd',
    $user_id,
    $month_year,
    $total_kwh,
    $total_cost,
    $total_co2,
    $solar_generated,
    $solar_savings,
    $solar_co2_saved
);

$ins->execute();

echo json_encode(['success' => true]);
exit;
?>
