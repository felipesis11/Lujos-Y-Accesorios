<?php
// ============================================
// CONFIGURACION DEL PANEL DE ADMINISTRACION
// ============================================
// CAMBIA ESTA CONTRASENA por la que tu quieras:
//   1. Ve a https://lujosyaccesorios.com/admin/
//   2. Entra con la contrasena actual: lujos2026
//   3. Cambiala desde el propio panel (boton "Cambiar contrasena")
//
// O si prefieres, edita el hash debajo. Para generar un hash nuevo,
// visita: https://lujosyaccesorios.com/admin/crear-password.php
// ============================================

define('ADMIN_PASSWORD_HASH', '$2y$10$hmDTcYMLL0qwsd5OJ.LQ2.LqWS3Hq2w9JM/FnjTdSVGNhi6nYOV0e');

// Ruta de la carpeta donde se guardan las fotos subidas desde el panel
define('UPLOADS_DIR', __DIR__ . '/../img/repuestos-extra');

// Ruta del archivo JS del catalogo extra (se genera solo, no lo edites)
define('EXTRA_JS_FILE', __DIR__ . '/../js/catalogo-extra.js');

// Tamano maximo de foto permitido (5 MB)
define('MAX_FILE_SIZE', 5 * 1024 * 1024);

// Marcas disponibles para subir repuestos
$GLOBALS['MARCAS'] = ['Chevrolet', 'Jac', 'Foton', 'Jmc'];