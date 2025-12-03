<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    die("not_logged");
}

include "conexao.php";

$user_id = $_SESSION['user_id'];
$consumo_total = $_POST['consumo_total'];

$sql = $conn->prepare("INSERT INTO simulacoes (user_id, consumo_total) VALUES (?, ?)");
$sql->bind_param("id", $user_id, $consumo_total);

echo ($sql->execute()) ? "ok" : "error";
