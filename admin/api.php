<?php
// ============================================
// API DEL PANEL DE ADMINISTRACION
// Endpoints (todos por POST, responden JSON):
//   login   -> { ok:true }
//   logout  -> { ok:true }
//   upload  -> sube foto + datos del repuesto
//   list    -> lista los repuestos subidos
//   delete  -> borra un repuesto subido
//   chpass  -> cambia la contrasena
// ============================================

require __DIR__ . '/config.php';
require __DIR__ . '/lib.php';

// Evitar cache
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Content-Type: application/json; charset=utf-8');

ini_set('display_errors', '0');
error_reporting(E_ALL);

session_start();

$action = isset($_POST['action']) ? $_POST['action'] : '';

switch ($action) {

    // ----------------------------------------
    case 'login':
        $token = isset($_POST['token']) ? $_POST['token'] : '';
        // Genear un token de sesion aleatorio
        if (password_verify($token, ADMIN_PASSWORD_HASH)) {
            $_SESSION['admin'] = true;
            $_SESSION['token'] = bin2hex(random_bytes(16));
            json_out(['ok' => true, 'token' => $_SESSION['token']]);
        } else {
            sleep(1); // ralentizar ataques de fuerza bruta
            json_error('Contraseña incorrecta', 401);
        }
        break;

    // ----------------------------------------
    case 'logout':
        $_SESSION['admin'] = false;
        session_destroy();
        json_out(['ok' => true]);
        break;

    // ----------------------------------------
    case 'upload':
        must_be_admin();
        try {
            $resultado = subir_repuesto();
            json_out(['ok' => true, 'repuesto' => $resultado]);
        } catch (Exception $e) {
            json_error($e->getMessage(), 400);
        }
        break;

    // ----------------------------------------
    case 'list':
        must_be_admin();
        json_out(['ok' => true, 'repuestos' => listar_repuestos()]);
        break;

    // ----------------------------------------
    case 'delete':
        must_be_admin();
        $id = isset($_POST['id']) ? trim($_POST['id']) : '';
        if (!preg_match('/^[a-z0-9-]+$/i', $id)) {
            json_error('ID inválido', 400);
        }
        try {
            eliminar_repuesto($id);
            json_out(['ok' => true]);
        } catch (Exception $e) {
            json_error($e->getMessage(), 400);
        }
        break;

    // ----------------------------------------
    case 'chpass':
        must_be_admin();
        $actual = isset($_POST['actual']) ? $_POST['actual'] : '';
        $nueva  = isset($_POST['nueva']) ? $_POST['nueva'] : '';
        if (!password_verify($actual, ADMIN_PASSWORD_HASH)) {
            json_error('La contraseña actual no es correcta', 401);
        }
        if (strlen($nueva) < 6) {
            json_error('La nueva contraseña debe tener al menos 6 caracteres', 400);
        }
        try {
            cambiar_contrasena($nueva);
            $_SESSION['admin'] = false;
            session_regenerate_id(true);
            json_out(['ok' => true]);
        } catch (Exception $e) {
            json_error($e->getMessage(), 400);
        }
        break;

    // ----------------------------------------
    default:
        json_error('Acción no válida', 400);
}