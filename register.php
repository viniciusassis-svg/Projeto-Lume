<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    echo json_encode(['success' => false, 'error' => 'Requisição inválida']);
    exit;
}

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$name || !$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'Campos obrigatórios ausentes']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Email inválido']);
    exit;
}

/* Verifica email existente */
$stmt = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco: ' . $conn->error]);
    exit;
}
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Email já cadastrado']);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

/* Insere usuário */
$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Erro no banco: ' . $conn->error]);
    exit;
}
$stmt->bind_param('sss', $name, $email, $hash);
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'error' => 'Erro ao inserir usuário: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
exit;
?>