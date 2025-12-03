<?php
// Sem linhas ou espaços antes de <?php — salvar em UTF-8 sem BOM
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /ezsite/index.html?redirect=/ezsite/dashboard.php');
    exit;
}

// Exibe o HTML estático do dashboard (mantém dashboard.html)
readfile(__DIR__ . '/dashboard.html');
exit;
?>