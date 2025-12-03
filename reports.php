<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: /ezsite/index.html?redirect=/ezsite/reports.php');
    exit;
}
readfile(__DIR__ . '/reports.html');
exit;
?>
