/* ===========================================================================
   BUSCADOR INTELIGENTE DE REPUESTOS
   ===========================================================================

   Ayuda al usuario a encontrar su repuesto dentro de la marca, el modelo
   y el año que ya eligio en el configurador. Entiende apodos ("stop",
   "bomper") y errores de ortografia ("farloa", "espego").

   NO inventa nada: filtra la lista real del catalogo (la misma que usa
   obtenerRepuestosActuales()) y pinta las tarjetas con crearElementoRepuesto(),
   asi que el flujo de agregar + resumen + cotizar por WhatsApp no cambia.
   Si no hay coincidencia, ofrece enviar foto por WhatsApp.

   No toca app.js: envuelve window.renderizarRepuestos para reaplicar el
   filtro despues de cada re-render (por ejemplo al agregar un repuesto).
   =========================================================================== */

const BuscadorRepuestos = (() => {
    // Grupos de sinonimos: formas de llamar la MISMA pieza.
    // Construidos con el vocabulario real de los 505 productos del catalogo
    // (farola 42, bomper 48, persiana 46, espejo 50, stop 10, cocuyo 6...)
    // mas la jerga de taller colombiana.
    const SINONIMOS = [
        ['farola', 'farolas', 'faro', 'faros', 'unidad', 'unidades'],
        ['stop', 'stops', 'trasera', 'traseras', 'trasero', 'traseros'],
        ['direccional', 'direccionales', 'intermitente', 'intermitentes'],
        ['exploradora', 'exploradoras', 'antiniebla', 'antinieblas', 'neblinera'],
        ['bomper', 'bumper', 'defensa', 'defensas'],
        ['espejo', 'espejos', 'retrovisor', 'retrovisores', 'luna', 'lunas'],
        ['manija', 'manijas', 'manilla', 'manillas', 'chapa', 'chapas'],
        ['guardabarro', 'guardabarros', 'guardafango', 'guardafangos', 'salpicadera', 'salpicaderas'],
        ['estribo', 'estribos', 'pisadera', 'pisaderas'],
        ['cromo', 'cromos', 'cromado', 'cromada', 'cromados', 'bocel', 'boceles', 'embellecedor'],
        ['persiana', 'rejilla', 'rejillas', 'parrilla', 'parrillas'],
        ['puntera', 'punteras', 'esquinera', 'esquineras'],
        ['tapa', 'tapas'],
        ['brazo', 'brazos'],
        ['cocuyo', 'cocuyos', 'miona', 'mionas'],
        ['vidrio', 'vidrios', 'parabrisas', 'panoramico', 'panoramicos'],
        ['tanque', 'tanques', 'tarro', 'tarros', 'deposito', 'depositos'],
        ['capot', 'capo', 'capots'],
        ['puerta', 'puertas'],
        ['logo', 'logos', 'emblema', 'emblemas'],
        ['techo', 'techos'],
        ['ceja', 'cejas']
    ];

    const MAX_RESULTADOS = 24;
    let consulta = '';
    let temporizador = null;
    let temporizadorTrack = null;
    let ultimaVerificada = '\0';

    function normalizar(s) {
        return String(s || '').toLowerCase()
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/ñ/g, 'n')
            .replace(/[^a-z0-9 ]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Singular aproximado para que "farolas" encuentre "farola" y al reves.
    function singular(tok) {
        if (tok.length > 5 && tok.endsWith('es')) return tok.slice(0, -2);
        if (tok.length > 4 && tok.endsWith('s')) return tok.slice(0, -1);
        return tok;
    }

    function tokensDe(texto) {
        return normalizar(texto).split(/\s+/).filter(t => t.length > 1);
    }

    function mismoGrupo(a, b) {
        if (a === b) return true;
        return SINONIMOS.some(g => g.includes(a) && g.includes(b));
    }

    function distancia(a, b) {
        // Levenshtein clasico; los tokens son cortos, no pesa.
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        let prev = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;
        for (let i = 1; i <= m; i++) {
            let cur = [i];
            for (let j = 1; j <= n; j++) {
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
            prev = cur;
        }
        return prev[n];
    }

    // Puntaje de un token de busqueda contra los tokens de un producto.
    function puntuarToken(q, pToks) {
        let mejor = 0;
        const vars = [q, singular(q)];
        for (const v of vars) {
            for (const p of pToks) {
                const pv = [p, singular(p)];
                for (const w of pv) {
                    if (v === w) mejor = Math.max(mejor, 3);
                    else if (mismoGrupo(v, w)) mejor = Math.max(mejor, 2.5);
                    else if (v.length >= 4 && (w.startsWith(v) || v.startsWith(w))) mejor = Math.max(mejor, 2);
                    else if (w.includes(v) || v.includes(w)) mejor = Math.max(mejor, 1.5);
                    else if (v.length >= 4 && w.length >= 4 && distancia(v, w) <= (v.length >= 6 ? 2 : 1)) {
                        mejor = Math.max(mejor, 1);
                    }
                }
            }
        }
        return mejor;
    }

    function contexto() {
        const marca = (typeof state !== 'undefined' && state.marca) ? state.marca : '';
        const modelo = (typeof state !== 'undefined' && state.modelo) ? state.modelo : '';
        const anio = (typeof state !== 'undefined' && state.anio && state.anio !== 'general') ? state.anio : '';
        return { marca, modelo, anio };
    }

    // Filtra una lista de repuestos por texto. Devuelve { resultados, total }.
    // Todos los tokens de la busqueda deben coincidir (AND) para no traer basura.
    function filtrar(lista, texto) {
        const qToks = tokensDe(texto);
        if (!qToks.length || !Array.isArray(lista)) return { resultados: [], total: 0 };
        const scored = [];
        for (const r of lista) {
            const pToks = tokensDe(r.nombre || '');
            if (!pToks.length) continue;
            let total = 0, ok = true;
            for (const q of qToks) {
                const pts = puntuarToken(q, pToks);
                if (pts <= 0) { ok = false; break; }
                total += pts;
            }
            if (ok) scored.push({ r, total });
        }
        scored.sort((a, b) => (b.total - a.total) || String(a.r.nombre).localeCompare(String(b.r.nombre)));
        return { resultados: scored.slice(0, MAX_RESULTADOS).map(s => s.r), total: scored.length };
    }

    function numeroWhatsapp() {
        let n = '';
        if (typeof BUSINESS_INFO !== 'undefined' && BUSINESS_INFO.whatsapp) n = BUSINESS_INFO.whatsapp;
        else if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.whatsapp) n = SITE_CONFIG.whatsapp;
        else n = '573124692806';
        return String(n).replace(/\D/g, '') || '573124692806';
    }

    function contarEl() { return document.getElementById('buscadorConteo'); }
    function tituloEl() { return document.getElementById('repuestosTitulo'); }
    function contenedorEl() { return document.getElementById('repuestosContainer'); }

    function pintar(resultados, total, texto) {
        const cont = contenedorEl();
        if (!cont) return;
        const ctx = contexto();
        const donde = [ctx.marca, ctx.modelo, ctx.anio].filter(Boolean).join(' ');
        cont.innerHTML = '';
        const sel = (typeof state !== 'undefined' && state.repuestosSeleccionados) ? state.repuestosSeleccionados : [];
        resultados.forEach(r => {
            cont.appendChild(crearElementoRepuesto(r, sel.includes(r.id)));
        });
        const t = tituloEl();
        if (t) t.textContent = total + (total === 1 ? ' resultado para ' : ' resultados para ') + '"' + texto.trim() + '"' + (donde ? ' en ' + donde : '');
        const c = contarEl();
        if (c) c.textContent = 'Mostrando ' + resultados.length + ' de ' + total + ' coincidencia' + (total === 1 ? '' : 's') + '. Toca + Agregar para cotizarlo.';
    }

    function pintarSinResultados(texto) {
        const cont = contenedorEl();
        if (!cont) return;
        const ctx = contexto();
        const donde = [ctx.marca, ctx.modelo, ctx.anio].filter(Boolean).join(' ');
        const msg = 'Hola, busco el repuesto "' + texto.trim() + '"' +
            (donde ? ' para ' + donde : '') + ' y no lo encuentro en la pagina. Les envio foto, me ayudan?';
        const url = 'https://wa.me/' + numeroWhatsapp() + '?text=' + encodeURIComponent(msg);
        cont.innerHTML =
            '<div class="buscador-vacio">' +
            '<div class="buscador-vacio-icono" aria-hidden="true">🔎</div>' +
            '<p><strong>No encontramos "' + texto.trim().replace(/</g, '&lt;') + '"</strong>' +
            (donde ? ' para tu <strong>' + donde.replace(/</g, '&lt;') + '</strong>' : '') + '.</p>' +
            '<p>Prueba con otra palabra (ej: "unidad" en vez de "farola") o envíanos una foto y lo conseguimos.</p>' +
            '<a class="btn-ayuda-wa" target="_blank" rel="noopener noreferrer" href="' + url + '">📱 Enviar foto por WhatsApp</a>' +
            '</div>';
        const t = tituloEl();
        if (t) t.textContent = 'Sin resultados para "' + texto.trim() + '"';
        const c = contarEl();
        if (c) c.textContent = '0 coincidencias. Te ayudamos por WhatsApp con una foto.';
    }

    function buscar(texto) {
        consulta = String(texto || '');
        const input = document.getElementById('buscadorInput');
        const limpiarBtn = document.getElementById('buscadorLimpiar');
        if (limpiarBtn) limpiarBtn.hidden = !consulta.trim();
        if (!consulta.trim()) {
            const c = contarEl();
            if (c) c.textContent = '';
            if (typeof renderizarOriginal === 'function') renderizarOriginal();
            else if (typeof window.renderizarRepuestos === 'function') window.renderizarRepuestos();
            return;
        }
        if (typeof obtenerRepuestosActuales !== 'function' || typeof crearElementoRepuesto !== 'function') return;
        const ctx = contexto();
        const c = contarEl();
        if (!ctx.modelo) {
            if (c) c.textContent = 'Primero elige el modelo y el año de tu camión ☝️ y luego busca aquí.';
            return;
        }
        const lista = obtenerRepuestosActuales();
        const { resultados, total } = filtrar(lista, consulta);
        if (!resultados.length) pintarSinResultados(consulta);
        else pintar(resultados, total, consulta);
        // Seguro contra carreras de pintado: la app pinta su parrilla con
        // requestAnimationFrame y un re-render tardio podria pisar estos
        // resultados. Se verifica una sola vez por consulta (idempotente).
        if (ultimaVerificada !== consulta) {
            ultimaVerificada = consulta;
            setTimeout(() => {
                if (consulta.trim() && consulta === ultimaVerificada) buscar(consulta);
            }, 250);
        }
    }

    function programar(texto) {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => buscar(texto), 180);
        // Tracking con debounce aparte para no ensuciar las metricas.
        clearTimeout(temporizadorTrack);
        temporizadorTrack = setTimeout(() => {
            if (typeof trackEvent === 'function' && String(texto || '').trim().length >= 3) {
                trackEvent('buscar_repuesto', 'buscador', String(texto).trim().slice(0, 40));
            }
        }, 900);
    }

    function limpiar(reenderizar) {
        consulta = '';
        ultimaVerificada = '\0';
        const input = document.getElementById('buscadorInput');
        if (input) input.value = '';
        const limpiarBtn = document.getElementById('buscadorLimpiar');
        if (limpiarBtn) limpiarBtn.hidden = true;
        const c = contarEl();
        if (c) c.textContent = '';
        if (reenderizar !== false && typeof renderizarOriginal === 'function') renderizarOriginal();
    }

    // Referencia a la funcion original para restaurar la vista completa.
    let renderizarOriginal = null;

    // Busqueda pendiente desde una tarjeta de categoria ("Persianas",
    // "Exploradoras"...). Si ya elegiste marca y modelo, busca de una vez;
    // si no, te lleva a elegir marca y aplica la busqueda al llegar.
    let pendiente = '';

    function irACategoria(q) {
        pendiente = String(q || '').trim();
        if (!pendiente) return;
        if (typeof trackEvent === 'function') trackEvent('buscador_categoria', 'buscador', pendiente);
        const conf = document.getElementById('configurador');
        const listo = conf && getComputedStyle(conf).display !== 'none' &&
            typeof state !== 'undefined' && state.marca && state.modelo;
        if (listo) {
            aplicarPendiente();
        } else {
            if (typeof Navegacion !== 'undefined' && Navegacion.desplazarA) Navegacion.desplazarA('marcas');
            else location.hash = '#marcas';
            if (typeof mostrarNotificacion === 'function') {
                mostrarNotificacion("Elige tu marca y buscamos '" + pendiente + "'", 'info');
            }
        }
    }

    function aplicarPendiente() {
        if (!pendiente) return;
        const q = pendiente;
        pendiente = '';
        const input = document.getElementById('buscadorInput');
        if (!input) return;
        input.value = q;
        buscar(q);
        const caja = document.querySelector('.buscador-repuestos');
        if (caja && caja.scrollIntoView) caja.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function init() {
        const input = document.getElementById('buscadorInput');
        const cont = contenedorEl();
        if (!input || !cont) return; // esta pagina no tiene configurador
        if (typeof registerGlobal === 'function') {
            registerGlobal('BuscadorRepuestos', BuscadorRepuestos);
            registerGlobal('irACategoria', irACategoria);
        }

        // Reaplicar el filtro tras cada re-render de la app (ej: al agregar
        // un repuesto, renderizarRepuestos() restaura la lista completa).
        // Se espera ~80ms porque la app pinta con requestAnimationFrame.
        if (typeof window.renderizarRepuestos === 'function' && !window.renderizarRepuestos.__buscador) {
            renderizarOriginal = window.renderizarRepuestos;
            const envuelta = function () {
                renderizarOriginal.apply(this, arguments);
                if (consulta.trim()) {
                    setTimeout(() => { if (consulta.trim()) buscar(consulta); }, 80);
                }
            };
            envuelta.__buscador = true;
            window.renderizarRepuestos = envuelta;
        } else if (typeof renderizarRepuestos === 'function') {
            renderizarOriginal = renderizarRepuestos;
        }

        input.addEventListener('input', () => programar(input.value));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { limpiar(); input.blur(); }
        });
        const limpiarBtn = document.getElementById('buscadorLimpiar');
        if (limpiarBtn) limpiarBtn.addEventListener('click', () => { limpiar(); input.focus(); });

        // Atajos: rellenan la caja y buscan.
        document.querySelectorAll('.buscador-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                input.value = chip.dataset.q || chip.textContent;
                buscar(input.value);
                if (typeof trackEvent === 'function') {
                    trackEvent('buscador_atajo', 'buscador', chip.dataset.q || '');
                }
                input.focus();
            });
        });

        // Si cambia el modelo o el año, la lista de la app se reconstruye.
        // La busqueda NO se pierde: se reaplica sobre la lista nueva
        // (incluida una pendiente que venia de una tarjeta de categoria).
        // Solo se limpia si no habia nada escrito.
        ['modeloSelect', 'anioSelect'].forEach(id => {
            const sel = document.getElementById(id);
            if (sel) sel.addEventListener('change', () => {
                if (pendiente || hayBusqueda()) {
                    setTimeout(() => {
                        if (pendiente) aplicarPendiente();
                        else if (hayBusqueda()) buscar(consulta);
                    }, 350);
                } else {
                    limpiar();
                }
            });
        });

        // Al elegir otra marca se empieza de cero; si venias de una
        // tarjeta de categoria, se aplica tu busqueda al llegar.
        document.addEventListener('click', (e) => {
            if (e.target.closest && e.target.closest('.marca-card')) {
                limpiar(false);
                if (pendiente) setTimeout(aplicarPendiente, 900);
            }
        });
    }

    return {
        init, buscar, filtrar, limpiar, irACategoria,
        consultaActiva: () => consulta,
        hayBusqueda: () => consulta.trim().length > 0
    };
})();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BuscadorRepuestos.init());
} else {
    BuscadorRepuestos.init();
}
