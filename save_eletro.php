<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    die("not_logged");
}

include "conexao.php";

$user_id = $_SESSION['user_id'];
$nome = $_POST['nome'];
$potencia = $_POST['potencia'];
$horas = $_POST['horas'];

$consumo = ($potencia * $horas) / 1000; 

$sql = $conn->prepare("INSERT INTO eletrodomesticos (user_id, nome, potencia, horas, consumo) VALUES (?, ?, ?, ?, ?)");
$sql->bind_param("isddd", $user_id, $nome, $potencia, $horas, $consumo);

if ($sql->execute()) {
    echo "ok";
} else {
    echo "error";
}
