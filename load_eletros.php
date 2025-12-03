<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    die("not_logged");
}

include "conexao.php";

$user_id = $_SESSION['user_id'];

$sql = $conn->prepare("SELECT * FROM eletrodomesticos WHERE user_id = ?");
$sql->bind_param("i", $user_id);
$sql->execute();
$result = $sql->get_result();

$dados = [];

while($row = $result->fetch_assoc()){
    $dados[] = $row;
}

echo json_encode($dados);
