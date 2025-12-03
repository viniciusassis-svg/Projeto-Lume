<?php
$host = 'localhost';
$user = 'root';
$pass = '';
$dbname = 'lume_db';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    error_log('DB connect error: ' . $conn->connect_error);
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro de conexão com o banco']);
    exit;
}
$conn->set_charset('utf8mb4');
?>