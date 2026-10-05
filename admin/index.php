<?php
// ============================================
// PANEL DE ADMINISTRACION - Subir repuestos
// ============================================
require __DIR__ . '/config.php';

session_start();
$logueado = !empty($_SESSION['admin']);
$marcas = $GLOBALS['MARCAS'];
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panel de Administración — Lujos y Accesorios</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
    .cabecera { background: #c4161c; color: #fff; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
    .cabecera h1 { font-size: 1.3rem; }
    .cabecera a { color: #fff; text-decoration: none; font-weight: 600; }
    .contenedor { max-width: 800px; margin: 30px auto; padding: 0 20px; }
    .tarjeta { background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 20px rgba(0,0,0,.3); }
    .tarjeta h2 { margin-bottom: 16px; font-size: 1.1rem; color: #fbbf24; }
    label { display: block; margin: 12px 0 6px; font-size: .9rem; color: #94a3b8; }
    input, select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; font-size: 1rem; }
    input:focus, select:focus { outline: 2px solid #c4161c; }
    .fila { display: flex; gap: 12px; }
    .fila > div { flex: 1; }
    .btn { display: inline-block; padding: 12px 22px; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .btn-primario { background: #c4161c; color: #fff; }
    .btn-primario:hover { background: #a01218; }
    .btn-secundario { background: #334155; color: #e2e8f0; }
    .btn-peligro { background: #dc2626; color: #fff; }
    .oculto { display: none; }
    .mensaje { padding: 10px 14px; border-radius: 8px; margin: 12px 0; display: none; }
    .mensaje.ok { display: block; background: #16a34a22; border: 1px solid #16a34a; color: #86efac; }
    .mensaje.error { display: block; background: #dc262622; border: 1px solid #dc2626; color: #fca5a5; }
    .barra-subida { width: 100%; height: 6px; background: #334155; border-radius: 3px; margin-top: 10px; display: none; }
    .barra-subida > div { height: 100%; width: 0; background: #16a34a; border-radius: 3px; transition: width .3s; }
    .lista-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: #0f172a; border-radius: 8px; margin-bottom: 10px; }
    .lista-item img { width: 70px; height: 60px; object-fit: contain; background: #fff; border-radius: 6px; padding: 4px; }
    .lista-item .info { flex: 1; }
    .lista-item .info strong { display: block; }
    .lista-item .info small { color: #94a3b8; }
    .lista-item .btn { font-size: .85rem; padding: 6px 12px; }
    .vacia { text-align: center; color: #64748b; padding: 20px; }
    .cargando { color: #94a3b8; text-align: center; padding: 20px; }
    input[type=file] { padding: 8px; }
    .nota { font-size: .8rem; color: #64748b; margin-top: 8px; }
    .enlace-sw { position: fixed; bottom: 20px; right: 20px; font-size: .75rem; color: #475569; }
</style>
</head>
<body>

<div class="cabecera">
    <h1>⚙️ Panel de Administración</h1>
    <?php if ($logueado): ?>
        <a href="#" id="btnSalir">Cerrar sesión</a>
    <?php endif; ?>
</div>

<div class="contenedor">

    <!-- ===== LOGIN ===== -->
    <div id="vistaLogin" class="tarjeta <?php echo $logueado ? 'oculto' : ''; ?>">
        <h2>🔒 Iniciar sesión</h2>
        <div id="msgLogin" class="mensaje error"></div>
        <label for="clave">Contraseña</label>
        <input type="password" id="clave" placeholder="Tu contraseña de administración" autocomplete="current-password">
        <div style="margin-top:16px">
            <button class="btn btn-primario" id="btnLogin">Entrar</button>
        </div>
    </div>

    <!-- ===== PANEL ===== -->
    <div id="vistaPanel" class="<?php echo $logueado ? '' : 'oculto'; ?>">

        <!-- Subir repuesto -->
        <div class="tarjeta">
            <h2>📸 Subir un repuesto nuevo</h2>
            <div id="msgSubir" class="mensaje error"></div>
            <form id="formSubir" enctype="multipart/form-data">
                <label for="nombre">Nombre del repuesto *</label>
                <input type="text" id="nombre" name="nombre" required placeholder="Ej: Farola Parada" maxlength="80">

                <div class="fila">
                    <div>
                        <label for="marca">Marca *</label>
                        <select id="marca" name="marca" required>
                            <?php foreach ($marcas as $m): ?>
                                <option value="<?php echo htmlspecialchars($m); ?>"><?php echo htmlspecialchars($m); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div>
                        <label for="modelo">Modelo (opcional)</label>
                        <select id="modelo" name="modelo">
                            <option value="">Todos los modelos</option>
                        </select>
                    </div>
                </div>

                <div class="fila">
                    <div>
                        <label for="desde">Año inicial (opcional)</label>
                        <input type="number" id="desde" name="desde" min="1990" max="2030" placeholder="Ej: 2020">
                    </div>
                    <div>
                        <label for="hasta">Año final (opcional)</label>
                        <input type="number" id="hasta" name="hasta" min="1990" max="2030" placeholder="Ej: 2024">
                    </div>
                </div>
                <p class="nota">Si no pones años, el repuesto se mostrará para todos los años de ese modelo.</p>

                <label for="foto">Foto del repuesto *</label>
                <input type="file" id="foto" name="foto" accept="image/png,image/jpeg,image/webp" required>
                <p class="nota">Formatos: JPG, PNG o WEBP. Máximo 5 MB.</p>

                <div style="margin-top:16px">
                    <button type="submit" class="btn btn-primario" id="btnSubir">Subir repuesto</button>
                </div>
                <div class="barra-subida" id="barraSubida"><div></div></div>
            </form>
        </div>

        <!-- Cambiar contraseña -->
        <div class="tarjeta">
            <h2>🔑 Cambiar contraseña</h2>
            <div id="msgClave" class="mensaje error"></div>
            <label for="claveActual">Contraseña actual</label>
            <input type="password" id="claveActual" autocomplete="current-password">
            <label for="claveNueva">Contraseña nueva</label>
            <input type="password" id="claveNueva" autocomplete="new-password">
            <div style="margin-top:16px">
                <button class="btn btn-secundario" id="btnCambiarClave">Cambiar contraseña</button>
            </div>
        </div>

        <!-- Listado -->
        <div class="tarjeta">
            <h2>🗂️ Repuestos subidos</h2>
            <div id="listaRepuestos"><div class="cargando">Cargando...</div></div>
        </div>
    </div>

</div>

<p class="enlace-sw">Sistema admin — Lujos y Accesorios</p>

<script>
const API = 'api.php';
let sesion = <?php echo $logueado ? 'true' : 'false'; ?>;

function mostrarMsg(elId, texto, ok) {
    const el = document.getElementById(elId);
    el.textContent = texto;
    el.className = 'mensaje ' + (ok ? 'ok' : 'error');
}

function jsonPost(data, onFinish) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) fd.append(k, v);
    return fetch(API, { method: 'POST', body: fd })
        .then(r => r.json())
        .then(onFinish)
        .catch(() => mostrarMsg('msg', 'Error de conexión con el servidor.', false));
}

// ---------- LOGIN ----------
document.getElementById('btnLogin')?.addEventListener('click', () => {
    const clave = document.getElementById('clave').value;
    if (!clave) { mostrarMsg('msgLogin', 'Escribe la contraseña.', false); return; }
    jsonPost({ action: 'login', token: clave }, (r) => {
        if (r.ok) {
            sesion = true;
            document.getElementById('vistaLogin').classList.add('oculto');
            document.getElementById('vistaPanel').classList.remove('oculto');
            cargarLista();
            mostrarMsg('msgLogin', 'Sesión iniciada.', true);
        } else {
            mostrarMsg('msgLogin', r.error || 'Contraseña incorrecta.', false);
        }
    });
});

document.getElementById('clave')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btnLogin').click();
});

// ---------- LOGOUT ----------
document.getElementById('btnSalir')?.addEventListener('click', (e) => {
    e.preventDefault();
    fetch(API, { method: 'POST', body: new URLSearchParams({ action: 'logout' }) }).then(() => location.reload());
});

// ---------- MODELOS DINÁMICOS ----------
const MODELOS = {
    Chevrolet: ['NHR', 'NPR', 'NQR', 'NKR', 'FRR', 'FTR'],
    JAC:       ['JRR', 'JHR Power', 'JHR Power+'],
    Foton:     ['FHR', 'FQR', 'FRR', 'Aumark', 'Ollin'],
    JMC:       ['CHR', 'CKR', 'CQR']
};
const selMarca = document.getElementById('marca');
const selModelo = document.getElementById('modelo');

function cargarModelos() {
    const marca = selMarca.value;
    let opts = '<option value="">Todos los modelos</option>';
    (MODELOS[marca] || []).forEach(m => {
        opts += `<option value="${m}">${m}</option>`;
    });
    selModelo.innerHTML = opts;
}
selMarca?.addEventListener('change', cargarModelos);
cargarModelos();

// ---------- SUBIR ----------
document.getElementById('formSubir')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(document.getElementById('formSubir'));
    fd.append('action', 'upload');

    const boton = document.getElementById('btnSubir');
    const barra = document.getElementById('barraSubida').children[0];
    boton.disabled = true;
    document.getElementById('barraSubida').style.display = 'block';
    barra.style.width = '30%';

    fetch(API, { method: 'POST', body: fd })
        .then(r => r.json())
        .then((r) => {
            if (r.ok) {
                mostrarMsg('msgSubir', '✅ Repuesto subido correctamente.', true);
                document.getElementById('formSubir').reset();
                cargarModelos();
                cargarLista();
            } else {
                mostrarMsg('msgSubir', r.error || 'No se pudo subir.', false);
            }
        })
        .catch(() => mostrarMsg('msgSubir', 'Error de conexión con el servidor.', false))
        .finally(() => {
            boton.disabled = false;
            document.getElementById('barraSubida').style.display = 'none';
            barra.style.width = '0';
        });
});

// ---------- LISTAR ----------
function cargarLista() {
    const cont = document.getElementById('listaRepuestos');
    cont.innerHTML = '<div class="cargando">Cargando...</div>';
    fetch(API, { method: 'POST', body: new URLSearchParams({ action: 'list' }) })
        .then(r => r.json())
        .then((r) => {
            if (!r.ok) { cont.innerHTML = '<p class="vacia">' + (r.error || 'Error') + '</p>'; return; }
            if (!r.repuestos.length) { cont.innerHTML = '<p class="vacia">Aún no has subido repuestos.</p>'; return; }
            let html = '';
            r.repuestos.forEach(rp => {
                const modelo = rp.modelo && rp.modelo !== '*' ? rp.modelo : 'Todos';
                const anios = rp.anios ? ` · Años: ${rp.anios[0] ?? '?'}–${rp.anios[1] ?? '→'}` : ' · Todos los años';
                html += `
                    <div class="lista-item">
                        <img src="../${rp.img}" alt="${rp.nombre}" onerror="this.alt='(falta foto)'">
                        <div class="info">
                            <strong>${rp.nombre}</strong>
                            <small>${rp.marca} · ${modelo}${anios}</small>
                        </div>
                        <button class="btn btn-peligro" onclick="borrar('${rp.id}')">Borrar</button>
                    </div>`;
            });
            cont.innerHTML = html;
        })
        .catch(() => cont.innerHTML = '<p class="vacia">Error cargando la lista.</p>');
}

function borrar(id) {
    if (!confirm('¿Borrar este repuesto y su foto?')) return;
    fetch(API, { method: 'POST', body: new URLSearchParams({ action: 'delete', id: id }) })
        .then(r => r.json())
        .then(r => cargarLista())
        .catch(() => alert('Error al borrar.'));
}

// ---------- CAMBIAR CONTRASEÑA ----------
document.getElementById('btnCambiarClave')?.addEventListener('click', () => {
    const actual = document.getElementById('claveActual').value;
    const nueva = document.getElementById('claveNueva').value;
    if (!actual || !nueva) { mostrarMsg('msgClave', 'Completa ambos campos.', false); return; }
    if (nueva.length < 6) { mostrarMsg('msgClave', 'La contraseña debe tener al menos 6 caracteres.', false); return; }
    jsonPost({ action: 'chpass', actual, nueva }, (r) => {
        if (r.ok) {
            mostrarMsg('msgClave', '✅ Contraseña cambiada. Vuelve a iniciar sesión.', true);
            setTimeout(() => location.reload(), 1500);
        } else {
            mostrarMsg('msgClave', r.error || 'Error.', false);
        }
    });
});

<?php if ($logueado): ?>
cargarLista();
<?php endif; ?>
</script>
</body>
</html>