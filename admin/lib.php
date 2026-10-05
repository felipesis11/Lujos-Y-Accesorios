<?php
// ============================================
// FUNCIONES COMPARTIDAS DEL PANEL DE ADMINISTRACION
// ============================================

function json_out($data) {
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function must_be_admin() {
    if (empty($_SESSION['admin'])) {
        json_error('No autorizado. Inicia sesión primero.', 403);
    }
}

// --------------------------------------------
// MODELOS POR MARCA (igual que en js/app.js)
// --------------------------------------------
function modelos_de_marca($marca) {
    $map = [
        'Chevrolet' => ['NHR', 'NPR', 'NQR', 'NKR', 'FRR', 'FTR'],
        'JAC'       => ['JAC 1035,1040,1042,1048,1061,1083', 'POWER', 'POWER EURO 6'],
        'Foton'     => ['FHR', 'FQR', 'FRR', 'FKR', 'Ollin'],
        'JMC'       => ['CHR', 'CQR', 'CKR', 'CHR Euro 6', 'CQR Euro 6', 'CKR Euro 6'],
    ];
    return isset($map[$marca]) ? $map[$marca] : [];
}

// --------------------------------------------
// LECTURA / ESCRITURA DEL CATALOGO EXTRA
// El "archivo maestro" es admin/repuestos-extra.json
// y de ahi se genera js/catalogo-extra.js
// --------------------------------------------
function archivo_json() {
    return __DIR__ . '/repuestos-extra.json';
}

function leer_repuestos() {
    $f = archivo_json();
    if (!file_exists($f)) return [];
    $contenido = file_get_contents($f);
    $datos = json_decode($contenido, true);
    return is_array($datos) ? $datos : [];
}

function escribir_repuestos($lista) {
    $f = archivo_json();
    $tmp = $f . '.tmp';
    $ok = file_put_contents($tmp, json_encode($lista, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    if ($ok === false) {
        throw new Exception('No se pudo escribir el archivo de datos. Revisa los permisos.');
    }
    if (!@rename($tmp, $f)) {
        @unlink($tmp);
        throw new Exception('No se pudo guardar el archivo de datos.');
    }
    regenerar_catalogo_extra_js($lista);
}

// Genera js/catalogo-extra.js a partir de la lista
function regenerar_catalogo_extra_js($lista) {
    $js = "// ============================================\n"
        . "// REPUESTOS SUBIDOS DESDE EL PANEL DE ADMINISTRACION\n"
        . "// NO EDITAR A MANO - se regenera solo\n"
        . "// ============================================\n\n"
        . "window.REPUESTOS_EXTRA = "
        . json_encode($lista, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        . ";\n";
    $destino = EXTRA_JS_FILE;
    $tmp = $destino . '.tmp';
    $ok = file_put_contents($tmp, $js);
    if ($ok === false) {
        throw new Exception('No se pudo escribir js/catalogo-extra.js. Revisa los permisos de la carpeta js/');
    }
    if (!@rename($tmp, $destino)) {
        @unlink($tmp);
        throw new Exception('No se pudo guardar js/catalogo-extra.js.');
    }
}

// --------------------------------------------
// SUBIR UN REPUESTO NUEVO
// --------------------------------------------
function subir_repuesto() {
    $marca  = isset($_POST['marca'])  ? trim($_POST['marca'])  : '';
    $modelo = isset($_POST['modelo']) ? trim($_POST['modelo']) : '';
    $nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
    $desde  = isset($_POST['desde'])  ? trim($_POST['desde'])  : '';
    $hasta  = isset($_POST['hasta'])  ? trim($_POST['hasta'])  : '';

    // Validar marca
    $marcas = ['Chevrolet', 'JAC', 'Foton', 'JMC'];
    if (!in_array($marca, $marcas, true)) {
        throw new Exception('Marca no válida.');
    }

    // Validar nombre
    if ($nombre === '') {
        throw new Exception('Escribe el nombre del repuesto.');
    }
    if (mb_strlen($nombre) > 80) {
        throw new Exception('El nombre es demasiado largo (máx. 80 caracteres).');
    }

    // Validar modelo: vacio = aplica a todos; si no, debe existir en la marca
    if ($modelo !== '' && !in_array($modelo, modelos_de_marca($marca), true)) {
        throw new Exception('El modelo no pertenece a la marca seleccionada.');
    }

    // Validar años
    $anios = null;
    if ($desde !== '' || $hasta !== '') {
        $anioDesde = $desde !== '' ? (int)$desde : null;
        $anioHasta = $hasta !== '' ? (int)$hasta : null;
        $anioActual = (int)date('Y') + 1;
        foreach ([$anioDesde, $anioHasta] as $a) {
            if ($a !== null && ($a < 1990 || $a > $anioActual)) {
                throw new Exception("Año inválido ($a). Debe estar entre 1990 y $anioActual.");
            }
        }
        if ($anioDesde !== null && $anioHasta !== null && $anioDesde > $anioHasta) {
            throw new Exception('El año inicial no puede ser mayor que el final.');
        }
        $anios = [$anioDesde, $anioHasta];
    }

    // Validar foto
    if (empty($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No se recibió la foto. Selecciona un archivo.');
    }
    $foto = $_FILES['foto'];
    if ($foto['size'] > MAX_FILE_SIZE) {
        throw new Exception('La foto pesa más de 5 MB. Usa una imagen más liviana.');
    }

    // Verificar que realmente es una imagen
    $info = @getimagesize($foto['tmp_name']);
    if ($info === false) {
        throw new Exception('El archivo no es una imagen válida (JPG, PNG o WEBP).');
    }

    $ext = strtolower(pathinfo($foto['name'], PATHINFO_EXTENSION));
    $extValidas = ['jpg', 'jpeg', 'png', 'webp'];
    if (!in_array($ext, $extValidas, true)) {
        throw new Exception('Formato no permitido. Usa JPG, PNG o WEBP.');
    }
    if ($ext === 'jpeg') $ext = 'jpg';

    // Verificar el tipo MIME real
    $mime = isset($info['mime']) ? $info['mime'] : '';
    $mimeValidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($mime, $mimeValidos, true)) {
        throw new Exception('Tipo de imagen no permitido.');
    }

    // Crear subcarpeta por marca dentro de img/repuestos-extra/
    $carpetaMarca = strtolower($marca);
    $destinoDir = UPLOADS_DIR . '/' . $carpetaMarca;
    if (!is_dir($destinoDir) && !mkdir($destinoDir, 0755, true)) {
        throw new Exception('No se pudo crear la carpeta de destino.');
    }

    // Nombre de archivo seguro y unico
    $prefijo = slug($nombre) !== '' ? slug($nombre) : 'repuesto';
    $nombreArchivo = $prefijo . '-' . date('Ymd-His') . '-' . substr(bin2hex(random_bytes(3)), 0, 5) . '.' . $ext;
    $destino = $destinoDir . '/' . $nombreArchivo;

    if (!move_uploaded_file($foto['tmp_name'], $destino)) {
        throw new Exception('No se pudo guardar la foto en el servidor.');
    }

    // ID unico
    $id = strtolower($carpetaMarca) . '-' . ($modelo !== '' ? slug($modelo) : 'todos') . '-' . substr(bin2hex(random_bytes(4)), 0, 8);

    $repuesto = [
        'id'       => $id,
        'marca'    => $marca,
        'modelo'   => $modelo !== '' ? $modelo : '*',
        'nombre'   => $nombre,
        'img'      => 'img/repuestos-extra/' . $carpetaMarca . '/' . $nombreArchivo,
        'categoria'=> 'Catalogo',
        'anios'    => $anios,
    ];

    $lista = leer_repuestos();
    $lista[] = $repuesto;
    escribir_repuestos($lista);

    return $repuesto;
}

// --------------------------------------------
// LISTAR REPUESTOS SUBIDOS
// --------------------------------------------
function listar_repuestos() {
    return leer_repuestos();
}

// --------------------------------------------
// BORRAR UN REPUESTO SUBIDO
// --------------------------------------------
function eliminar_repuesto($id) {
    $lista = leer_repuestos();
    $nueva = [];
    $encontrado = false;
    foreach ($lista as $r) {
        if ($r['id'] === $id) {
            $encontrado = true;
            // Borrar la foto del disco (si existe)
            $ruta = __DIR__ . '/../' . $r['img'];
            if (isset($r['img']) && is_file($ruta)) {
                @unlink($ruta);
            }
            continue;
        }
        $nueva[] = $r;
    }
    if (!$encontrado) {
        throw new Exception('El repuesto no existe o ya fue borrado.');
    }
    escribir_repuestos($nueva);
}

// --------------------------------------------
// CAMBIAR CONTRASEÑA
// Escribe el nuevo hash dentro de config.php
// --------------------------------------------
function cambiar_contrasena($nueva) {
    $hash = password_hash($nueva, PASSWORD_DEFAULT);
    $archivo = __DIR__ . '/config.php';
    $contenido = file_get_contents($archivo);
    if ($contenido === false) {
        throw new Exception('No se pudo leer config.php');
    }
    // Usar callback para que $ en el hash no se interprete como backreference
    $nuevo = preg_replace_callback(
        "/define\('ADMIN_PASSWORD_HASH',\s*'[^']*'\);/",
        function ($m) use ($hash) {
            return "define('ADMIN_PASSWORD_HASH', '" . $hash . "');";
        },
        $contenido,
        1,
        $contado
    );
    if ($contado !== 1) {
        throw new Exception('No se encontró la línea de contraseña en config.php');
    }
    $tmp = $archivo . '.tmp';
    if (file_put_contents($tmp, $nuevo) === false) {
        throw new Exception('No se pudo escribir config.php');
    }
    if (!@rename($tmp, $archivo)) {
        @unlink($tmp);
        throw new Exception('No se pudo guardar la nueva contraseña');
    }
}

// --------------------------------------------
// UTILIDADES
// --------------------------------------------
function slug($texto) {
    $texto = strtolower($texto);
    $texto = str_replace(
        ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', ' '],
        ['a', 'e', 'i', 'o', 'u', 'n', 'u', '-'],
        $texto
    );
    $texto = preg_replace('/[^a-z0-9-]+/', '-', $texto);
    $texto = preg_replace('/-+/', '-', $texto);
    return trim($texto, '-');
}