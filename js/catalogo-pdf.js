/* ===========================================================================
   CATÁLOGO COMPLETO EN PDF (tarjeta compacta)
   ===========================================================================

   Solo dos botones: VER (abre el PDF en una pestaña nueva) y DESCARGAR.
   Son <a> reales, asi que funcionan con o sin JavaScript, con teclado,
   con el menu de contexto y para los buscadores.

   Toda la configuracion vive en CATALOG_CONFIG (js/config.js). Para cambiar
   el PDF solo hay que editar ese archivo; aqui no hay ninguna ruta escrita a
   mano, asi que no se puede desincronizar.

   Rutas: relativas a la raiz del sitio. Funcionan igual en local, en
   GitHub Pages y en un dominio propio. Nunca se usa C:\ ni una ruta del
   servidor.
   =========================================================================== */

const CatalogoPdf = (() => {
    // Valores por defecto: si js/config.js no cargara, la seccion no se rompe.
    const DEFECTO = {
        pdfUrl: 'catalogo/catalogo-lujos-y-accesorios.pdf',
        downloadName: 'catalogo-lujos-y-accesorios.pdf',
        coverImage: 'img/catalogo/portada-catalogo.jpg'
    };

    function config() {
        const c = (typeof CATALOG_CONFIG !== 'undefined' && CATALOG_CONFIG) ? CATALOG_CONFIG : {};
        return {
            pdfUrl: (c.pdfUrl || DEFECTO.pdfUrl).trim(),
            downloadName: (c.downloadName || DEFECTO.downloadName).trim(),
            coverImage: (c.coverImage || DEFECTO.coverImage).trim()
        };
    }

    // Comprueba que el archivo exista de verdad. Solo se usa para avisar por
    // consola; los botones nunca se ocultan porque son enlaces reales que
    // funcionan aunque esta comprobacion falle (por ejemplo, abriendo el
    // sitio como archivo local, donde fetch no esta permitido).
    // Se usa HEAD y no GET para no descargar el PDF entero: si el servidor
    // no admite HEAD se cae a un GET con Range para leer solo el primer byte.
    function existePdf(url) {
        return fetch(url, { method: 'HEAD', cache: 'no-store' })
            .then(r => {
                if (r.ok) return true;
                if (r.status === 405 || r.status === 501) return existePorRango(url);
                return false;
            })
            .catch(() => existePorRango(url));
    }

    function existePorRango(url) {
        return fetch(url, { headers: { Range: 'bytes=0-1023' }, cache: 'no-store' })
            .then(r => {
                if (r.status === 200) return true;
                return r.status === 206; // parcial: el archivo existe
            })
            .catch(() => false);
    }

    // ==========================================================
    // Integracion con el tracking que YA existe en app.js.
    // Se reutiliza trackEvent: no se crea un segundo sistema de
    // analytics. Si por lo que sea no estuviera disponible, se cae
    // a gtag directamente en vez de romper la pagina.
    // ==========================================================
    function registrar(accion, etiqueta) {
        if (typeof trackEvent === 'function') {
            trackEvent(accion, 'catalogo', etiqueta);
        } else if (window.gtag) {
            gtag('event', accion, { event_category: 'catalogo', event_label: etiqueta });
        }
    }

    // Boton principal: abrir el PDF. Intenta ademas la descarga, pero sin
    // molestar al usuario con una segunda pestana de descarga.
    function verCatalogo() {
        const cfg = config();
        registrar('click_catalogo_pdf', 'ver_catalogo');
        descargarEnSegundoPlano(cfg);
    }

    // Se intenta la descarga sin bloquear la visualizacion.
    // Se usa un <a download> temporal porque es el unico mecanismo que
    // realmente inicia una descarga desde JavaScript. Un iframe oculto NO
    // descargaba nada: solo cargaba el visor de PDF en segundo plano.
    // Si el navegador bloquea la descarga automatica, no pasa nada grave: el
    // PDF ya se abrio en la pestana nueva y queda el boton "DESCARGAR".
    function descargarEnSegundoPlano(cfg) {
        try {
            if (typeof HTMLAnchorElement === 'undefined' ||
                !('download' in HTMLAnchorElement.prototype)) {
                return; // no se forza nada: el usuario ya tiene "VER CATALOGO"
            }
            const enlace = document.createElement('a');
            enlace.href = cfg.pdfUrl;
            enlace.download = cfg.downloadName;
            enlace.rel = 'noopener';
            enlace.setAttribute('aria-hidden', 'true');
            enlace.style.display = 'none';
            document.body.appendChild(enlace);
            enlace.click();
            setTimeout(() => {
                if (enlace.parentNode) enlace.parentNode.removeChild(enlace);
            }, 0);
        } catch (e) {
            // Si la descarga no se puede iniciar, no es un error grave:
            // el PDF ya se abrio en la pestana nueva.
            console.warn('[CatalogoPdf] No se pudo iniciar la descarga en segundo plano.', e);
        }
    }

    // Boton secundario: descarga unicamente el PDF, conservando el nombre
    // profesional. Se deja que el navegador haga su trabajo normal, que es
    // lo mas compatible.
    function descargarCatalogo() {
        const cfg = config();
        registrar('download_catalogo_pdf', cfg.downloadName);
    }

    function aplicarTextos(cfg) {
        const ver = document.getElementById('btnVerCatalogo');
        if (ver) {
            ver.setAttribute('href', cfg.pdfUrl);
            // En "ver" no interesa la descarga: se anula el atributo para que
            // el navegador muestre su visor de PDF en lugar de descargar.
            ver.removeAttribute('download');
        }

        const bajar = document.getElementById('btnDescargarCatalogo');
        if (bajar) {
            bajar.setAttribute('href', cfg.pdfUrl);
            // Asi el archivo se guarda con el nombre profesional aunque el
            // servidor lo entregue con otro.
            bajar.setAttribute('download', cfg.downloadName);
        }

        const portada = document.getElementById('catalogoPortada');
        if (portada) {
            portada.setAttribute('src', cfg.coverImage);
        }
    }

    function comprobarPortada(cfg) {
        const portada = document.getElementById('catalogoPortada');
        const icono = document.getElementById('catalogoIcono');
        if (!portada) return;

        // El icono es el respaldo. Empieza oculto para no tapar una
        // portada real, y solo aparece si la imagen no se puede cargar.
        if (icono) icono.hidden = true;

        const usarIcono = () => {
            portada.hidden = true;
            if (icono) icono.hidden = false;
            // No es un fallo grave: la miniatura es un extra, los botones al
            // PDF son lo que importa. Solo se avisa por consola.
            console.warn('[CatalogoPdf] No hay portada en ' + cfg.coverImage + '. Se usa el icono.');
        };

        portada.addEventListener('error', usarIcono, { once: true });

        // Si la imagen ya habia fallado antes de escuchar el evento (por
        // ejemplo, por estar en la cache del navegador), el evento no se
        // vuelve a lanzar y la portada se quedaria rota a la vista.
        if (portada.complete && portada.naturalWidth === 0) usarIcono();
    }

    function init() {
        // Se registra aqui y no al cargar el archivo: asi el modulo funciona
        // este donde este en el HTML, sin depender del orden de los scripts.
        if (typeof registerGlobal === 'function') {
            registerGlobal('CatalogoPdf', CatalogoPdf);
            registerGlobal('verCatalogo', CatalogoPdf.verCatalogo);
            registerGlobal('descargarCatalogo', CatalogoPdf.descargarCatalogo);
        }

        const cfg = config();
        aplicarTextos(cfg);
        comprobarPortada(cfg);

        const ver = document.getElementById('btnVerCatalogo');
        if (ver) {
            ver.addEventListener('click', verCatalogo);
        }

        const bajar = document.getElementById('btnDescargarCatalogo');
        if (bajar) {
            bajar.addEventListener('click', descargarCatalogo);
        }

        // Aviso informativo por consola si el PDF no responde. No se oculta
        // nada: los botones son enlaces reales y siguen funcionando.
        existePdf(cfg.pdfUrl).then(ok => {
            if (!ok) {
                console.warn('[CatalogoPdf] El PDF no responde en ' + cfg.pdfUrl +
                    '. Revisa que el archivo exista en catalogo/catalogo-lujos-y-accesorios.pdf');
            }
        });
    }

    return { init, verCatalogo, descargarCatalogo, existePdf, config };
})();
