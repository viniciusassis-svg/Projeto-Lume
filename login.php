<?php
// salvar UTF-8 sem BOM, sem linhas antes de <?php
header('Content-Type: application/json');

ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/php_errors.log');

require_once __DIR__ . '/db.php';

// garantir cookie de sessão acessível a /ezsite
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/ezsite',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    echo json_encode(['success' => false, 'error' => 'Requisição inválida', 'raw' => $raw]);
    exit;
}

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'error' => 'Campos obrigatórios ausentes']);
    exit;
}

$stmt = $conn->prepare('SELECT id, name, password FROM users WHERE email = ? LIMIT 1');
if (!$stmt) {
    error_log('prepare failed: ' . $conn->error);
    echo json_encode(['success' => false, 'error' => 'Erro no banco']);
    exit;
}

$stmt->bind_param('s', $email);
if (!$stmt->execute()) {
    error_log('execute failed: ' . $stmt->error);
    echo json_encode(['success' => false, 'error' => 'Erro no banco']);
    exit;
}

$stmt->store_result();
if ($stmt->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'Usuário não encontrado']);
    $stmt->close();
    $conn->close();
    exit;
}

$stmt->bind_result($id, $name, $hash);
$stmt->fetch();

if (!password_verify($password, $hash)) {
    echo json_encode(['success' => false, 'error' => 'Credenciais inválidas']);
    $stmt->close();
    $conn->close();
    exit;
}

// sucesso: criar sessão
$_SESSION['user_id'] = $id;
$_SESSION['user_name'] = $name;

echo json_encode(['success' => true, 'id' => $id, 'name' => $name]);
$stmt->close();
$conn->close();
exit;
?>