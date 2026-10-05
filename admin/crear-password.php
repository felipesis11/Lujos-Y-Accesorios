<?php
// ============================================
// GENERAR UN HASH DE CONTRASEÑA NUEVO
// ============================================
// Sirve para crear un hash y pegarlo en admin/config.php
//
// USO:  Ve a lujosyaccesorios.com/admin/crear-password.php?p=NuevaClave
//       (debes estar logueado)
// ============================================

require __DIR__ . '/config.php';

session_start();

// Por seguridad pedimos sesión iniciada
if (empty($_SESSION['admin'])) {
    echo '<h2>Inicia sesión en /admin/ primero</h2>';
    exit;
}

if (!isset($_GET['p'])) {
    echo '<h2>Usa: crear-password.php?p=TuNuevaClave</h2>';
    exit;
}

$clave = $_GET['p'];
if (strlen($clave) < 6) {
    echo '<h2>La contraseña debe tener al menos 6 caracteres</h2>';
    exit;
}

echo '<h2>Hash generado:</h2>';
echo '<pre>' . htmlspecialchars(password_hash($clave, PASSWORD_DEFAULT)) . '</pre>';
echo '<p>Pégalo en admin/config.php en la línea ADMIN_PASSWORD_HASH</p>';