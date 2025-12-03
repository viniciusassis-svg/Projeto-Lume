<?php
// ...existing code...
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /ezsite/index.html'); // volta para a tela de login
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
<meta charset="utf-8">
<title>Landing - Protegida</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Bem-vindo, <?php echo htmlspecialchars($_SESSION['user_name'] ?? 'Usuário'); ?></h1>
  <p>Conteúdo da landing e demais elementos protegidos.</p>
  <p><a href="logout.php">Sair</a></p>
</body>
</html>