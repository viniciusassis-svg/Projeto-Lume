<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/ezsite',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();
session_unset();
session_destroy();
header('Location: index.html');
exit;
