// ============================================
// SEGURIDAD - Utilidades de sanitización y validación
// ============================================

console.log('[App] Iniciando aplicación...');

const SecurityUtils = {
    // Sanitizar HTML para prevenir XSS
    sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Sanitizar para atributos HTML
    sanitizeAttribute(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/"/g, '"')
            .replace(/'/g, '\'')
            .replace(/</g, '<')
            .replace(/>/g, '>');
    },

    // Validar ID de repuesto (solo alfanumérico, guiones, underscores)
    validateRepuestoId(id) {
        return /^[a-z0-9_-]+$/i.test(id);
    },

    // Validar año (4 dígitos, rango razonable)
    validateYear(year) {
        const y = parseInt(year, 10);
        return !isNaN(y) && y >= 1990 && y <= new Date().getFullYear() + 1;
    },

    // Validar modelo (lista blanca)
    validateModelo(marca, modelo) {
        const modelosValidos = DATA.modelos[marca] || [];
        return modelosValidos.includes(modelo);
    },

    // Validar URL de WhatsApp (solo wa.me)
    validateWhatsAppURL(url) {
        try {
            const u = new URL(url);
            return u.hostname === 'wa.me' || u.hostname === 'api.whatsapp.com';
        } catch {
            return false;
        }
    },

    // Rate limiting simple en memoria
    _rateLimits: new Map(),
    checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
        const now = Date.now();
        const requests = this._rateLimits.get(key) || [];
        const recent = requests.filter(t => now - t < windowMs);
        
        if (recent.length >= maxRequests) {
            return { allowed: false, retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000) };
        }
        
        recent.push(now);
        this._rateLimits.set(key, recent);
        return { allowed: true };
    },

    // Generar nonce para CSP inline scripts
    generateNonce() {
        try {
            const array = new Uint8Array(16);
            crypto.getRandomValues(array);
            return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
        } catch {
            // Fallback para contextos no seguros (file://, http://localhost)
            return Math.random().toString(36).substring(2, 18);
        }
    }
};

// Hacer disponible globalmente para uso en event handlers inline
window.SecurityUtils = SecurityUtils;

// ============================================
// EXPOSICIÓN GLOBAL DE FUNCIONES
// Las funciones se declaran como function declarations (hoisted),
// por lo que window.nombre ya apunta a la función real.
// ============================================

function registerGlobal(name, fn) {
    window[name] = fn;
}console.log('[App] SecurityUtils cargado');

// ============================================
// DATOS - ORIGINAL PRESERVADO
// ============================================

const DATA = {
    modelos: {
        Chevrolet: ['NHR', 'NPR', 'NQR', 'NKR', 'FRR', 'FTR'],
        JAC: ['JAC 1035,1040,1042,1048,1061,1083', 'POWER', 'POWER EURO 6'],
        Foton: ['FHR', 'FQR', 'FRR', 'FKR', 'Ollin'],
        JMC: ['CHR', 'CQR', 'CKR', 'CHR Euro 6', 'CQR Euro 6', 'CKR Euro 6']
    },
    
    repuestos: [
        { id: 'bomper', nombre: 'Bómper Delantero', img: 'img/repuestos/bomper.png', categoria: 'Carrocería' },
        { id: 'farolas', nombre: 'Farolas', img: 'img/repuestos/farola.png', categoria: 'Eléctrico' },
        { id: 'exploradoras', nombre: 'Exploradoras', img: 'img/repuestos/exploradoras.png', categoria: 'Eléctrico' },
        { id: 'espejos', nombre: 'Espejos Retrovisores', img: 'img/repuestos/espejos.png', categoria: 'Accesorios' },
        { id: 'estribos', nombre: 'Estribos', img: 'img/repuestos/estribos.png', categoria: 'Accesorios' },
        { id: 'guardabarros', nombre: 'Guardabarros', img: 'img/repuestos/guardabarros.png', categoria: 'Carrocería' },
        { id: 'cromos', nombre: 'Cromos Decorativos', img: 'img/repuestos/cromos.png', categoria: 'Estética' },
        { id: 'manijas', nombre: 'Manijas de Puerta', img: 'img/repuestos/manijas.png', categoria: 'Carrocería' },
        { id: 'accesorios', nombre: 'Kit de Accesorios', img: 'img/repuestos/accesorios.png', categoria: 'General' }
    ],

    /**
     * Videos de TikTok de la cuenta real:
     * https://www.tiktok.com/@lujosyaccesorioscamiones
     *
     * REGLA: no se inventan titulos, descripciones, vistas ni likes.
     * - `titulo` / `descripcion`: se obtienen de la API oficial oEmbed de
     *   TikTok (ver descargar-tiktok-oembed.ps1) y se guardan en
     *   js/tiktok-oembed.js. Aqui se dejan vacios ('') a proposito: el
     *   renderer usa el dato de oEmbed y no este campo.
     * - `vistas` / `likes`: NO se publican. Se dejan en '' siempre porque
     *   las cifras cambian y se inventarian.
     * - `url`: se usa la URL canonica de oEmbed
     *   (@cuenta/video/ID), no el enlace corto vt.tiktok.com, porque el
     *   corto pasa por una pagina de verificacion de TikTok.
     */
    tiktoks: [
        {
            id: 'video1',
            titulo: '',
            descripcion: '',
            imagen: 'img/tiktok/video1.jpg',
            url: 'https://www.tiktok.com/@lujosyaccesorioscamiones/video/7647705813611498772',
            videoId: '7647705813611498772',
            vistas: '',
            likes: ''
        },
        {
            id: 'video2',
            titulo: '',
            descripcion: '',
            imagen: 'img/tiktok/video2.jpg',
            url: 'https://www.tiktok.com/@lujosyaccesorioscamiones/video/7641617317150969108',
            videoId: '7641617317150969108',
            vistas: '',
            likes: ''
        },
        {
            id: 'video3',
            titulo: '',
            descripcion: '',
            imagen: 'img/tiktok/video3.jpg',
            url: 'https://www.tiktok.com/@lujosyaccesorioscamiones/video/7650628791219260692',
            videoId: '7650628791219260692',
            vistas: '',
            likes: ''
        }
    ]
};

// ============================================
// ERROR HANDLING - Centralizado
// ============================================

const ErrorHandler = {
    _logs: [],
    _maxLogs: 100,
    _consoleOriginal: null,
    
    // Capturar errores no manejados
    init() {
        window.addEventListener('error', (e) => this.handleError(e.error || new Error(e.message), {
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno,
            type: 'uncaught'
        }));
        
        window.addEventListener('unhandledrejection', (e) => {
            this.handleError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)), {
                type: 'unhandledrejection'
            });
        });
        
        // Interceptar console.error para logging.
        //
        // Se guarda la funcion original en una variable propia del objeto y NO
        // en un closure: handleError() necesita escribir en la consola sin pasar
        // por este interceptor. Si handleError() usara el console.error ya
        // parcheado, se llamaria a si mismo de forma infinita y el primer
        // error real provocaria "RangeError: Maximum call stack size
        // exceeded", que ademas ocultaba el error original que lo causo.
        this._consoleOriginal = console.error.bind(console);
        console.error = (...args) => {
            this.handleError(new Error(args.join(' ')), { type: 'console.error' });
            this._consoleOriginal(...args);
        };
    },
    
    handleError(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            message: error.message || String(error),
            stack: error.stack,
            context,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this._logs.push(logEntry);
        if (this._logs.length > this._maxLogs) this._logs.shift();
        
        // En producción: enviar a Sentry/log server
        if (window.Sentry) {
            window.Sentry.captureException(error, { extra: context });
        }
        
        // En desarrollo: log visible.
        // OJO: se usa la consola original, no el console.error interceptado.
        if (this._consoleOriginal) {
            this._consoleOriginal('[ErrorHandler]', logEntry);
        } else {
            console.error('[ErrorHandler]', logEntry);
        }
        
        // Notificar usuario si es error crítico de UI
        if (context.critical) {
            this.showUserError('Ocurrió un error inesperado. Por favor recarga la página.');
        }
    },
    
    showUserError(message) {
        const notif = document.getElementById('notificacion');
        if (notif) {
            const text = document.getElementById('notifText');
            const icon = document.getElementById('notifIcon');
            if (text && icon) {
                text.textContent = message;
                icon.textContent = '⚠';
                notif.className = 'notificacion error mostrar';
            }
        }
    },
    
    // Wrapper seguro para async functions
    async safeAsync(fn, context = {}) {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error, { ...context, async: true });
            throw error; // Re-lanzar para que el caller decida
        }
    },
    
    // Wrapper para event handlers
    safeHandler(fn, context = {}) {
        return (event) => {
            try {
                return fn(event);
            } catch (error) {
                this.handleError(error, { ...context, eventType: event.type });
            }
        };
    },
    
    getLogs() {
        return [...this._logs];
    },
    
    clearLogs() {
        this._logs = [];
    }
};

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => ErrorHandler.init());

// ============================================
// PERFORMANCE - Monitoreo y optimizaciones
// ============================================

const PerformanceMonitor = {
    _metrics: {},
    _observers: [],
    
    init() {
        // Web Vitals - LCP, INP, CLS
        this._observeWebVitals();
        
        // Resource timing
        this._logResourceTiming();
        
        // Navigation timing
        this._logNavigationTiming();
        
        // Memory (si disponible)
        if (performance.memory) {
            setInterval(() => this._logMemory(), 30000);
        }
    },
    
    _observeWebVitals() {
        // LCP - Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this._recordMetric('LCP', lastEntry.startTime);
                    this._sendToAnalytics('LCP', lastEntry.startTime);
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                this._observers.push(lcpObserver);
            } catch (e) {}
            
            // INP - Interaction to Next Paint (reemplaza a FID desde 2024:
            // mide la latencia de TODAS las interacciones, no solo la primera).
            // Se implementa con la API Event Timing: el peor interactionId
            // observado aproxima el INP real de la pagina.
            try {
                let peorInteraccion = 0;
                const inpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.interactionId && entry.interactionId > 0) {
                            const latencia = entry.processingEnd - entry.startTime;
                            if (latencia > peorInteraccion) {
                                peorInteraccion = latencia;
                                this._recordMetric('INP', peorInteraccion);
                                this._sendToAnalytics('INP', peorInteraccion);
                            }
                        }
                    });
                });
                inpObserver.observe({ type: 'event', buffered: true, durationThreshold: 16 });
                this._observers.push(inpObserver);
            } catch (e) {}
            
            // CLS - Cumulative Layout Shift
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    this._recordMetric('CLS', clsValue);
                    this._sendToAnalytics('CLS', clsValue);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
                this._observers.push(clsObserver);
            } catch (e) {}
        }
    },
    
    _recordMetric(name, value) {
        this._metrics[name] = value;
        console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    },
    
    _sendToAnalytics(name, value) {
        if (window.gtag) {
            gtag('event', 'web_vitals', {
                event_category: 'performance',
                event_label: name,
                value: Math.round(value),
                metric_name: name,
                metric_value: value
            });
        }
    },
    
    _logResourceTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources
                    .filter(r => r.duration > 500)
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 10);
                
                if (slowResources.length > 0) {
                    console.group('[Performance] Recursos lentos (>500ms)');
                    slowResources.forEach(r => console.log(`${r.duration.toFixed(0)}ms - ${r.name}`));
                    console.groupEnd();
                }
                
                // Total transfer size
                const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
                console.log(`[Performance] Total transfer: ${(totalSize / 1024).toFixed(1)} KB`);
            }, 0);
        });
    },
    
    _logNavigationTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const nav = performance.getEntriesByType('navigation')[0];
                if (nav) {
                    console.log('[Performance] Navigation:', {
                        'DNS': `${(nav.domainLookupEnd - nav.domainLookupStart).toFixed(0)}ms`,
                        'TCP': `${(nav.connectEnd - nav.connectStart).toFixed(0)}ms`,
                        'TTFB': `${(nav.responseStart - nav.requestStart).toFixed(0)}ms`,
                        'Download': `${(nav.responseEnd - nav.responseStart).toFixed(0)}ms`,
                        'DOM Interactive': `${nav.domInteractive.toFixed(0)}ms`,
                        'DOM Complete': `${nav.domComplete.toFixed(0)}ms`,
                        'Load Event': `${nav.loadEventEnd.toFixed(0)}ms`
                    });
                }
            }, 0);
        });
    },
    
    _logMemory() {
        if (performance.memory) {
            const mem = performance.memory;
            console.log('[Performance] Memory:', {
                used: `${(mem.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB`,
                total: `${(mem.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB`,
                limit: `${(mem.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB`
            });
        }
    },
    
    // Medir tiempo de ejecución de funciones
    measure(fn, name) {
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        this._recordMetric(`fn:${name}`, duration);
        return result;
    },
    
    // Medir async functions
    async measureAsync(fn, name) {
        const start = performance.now();
        const result = await fn();
        const duration = performance.now() - start;
        this._recordMetric(`async:${name}`, duration);
        return result;
    },
    
    getMetrics() {
        return { ...this._metrics };
    },
    
    cleanup() {
        this._observers.forEach(o => o.disconnect());
        this._observers = [];
    }
};

// Inicializar performance monitoring
document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());

// ============================================
// IMAGE LAZY LOADING MEJORADO
// ============================================

const ImageOptimizer = {
    _observer: null,
    
    init() {
        if (!('IntersectionObserver' in window)) return;
        
        this._observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this._loadImage(entry.target);
                    this._observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        // Observar imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => this._observer.observe(img));
    },
    
    _loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        
        if (src) {
            // Preload para mejor LCP
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
            
            img.src = src;
            img.removeAttribute('data-src');
        }
        
        if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
        img.removeAttribute('loading');
    },
    
    // Generar srcset responsive
    generateSrcset(basePath, widths = [320, 640, 960, 1280]) {
        return widths.map(w => `${basePath}?w=${w} ${w}w`).join(', ');
    },
    
    // Placeholder blur (base64 tiny)
    getBlurPlaceholder() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
};

// Inicializar lazy loading
document.addEventListener('DOMContentLoaded', () => ImageOptimizer.init());

// ============================================
// ACCESIBILIDAD - Focus management, ARIA, navegación teclado
// ============================================

const AccessibilityUtils = {
    _focusStack: [],
    _lastFocused: null,
    
    // Guardar foco actual
    saveFocus() {
        this._lastFocused = document.activeElement;
    },
    
    // Restaurar foco
    restoreFocus() {
        if (this._lastFocused && this._lastFocused.focus) {
            this._lastFocused.focus();
        }
    },
    
    // Trapar foco en un contenedor (modal, drawer)
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTab = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };
        
        container.addEventListener('keydown', handleTab);
        firstElement?.focus();
        
        return () => container.removeEventListener('keydown', handleTab);
    },
    
    // Anunciar a lectores de pantalla
    announce(message, priority = 'polite') {
        const liveRegion = this._getOrCreateLiveRegion(priority);
        liveRegion.textContent = '';
        // Forzar reflow
        liveRegion.offsetHeight;
        liveRegion.textContent = message;
    },
    
    _getOrCreateLiveRegion(priority) {
        const id = `a11y-live-${priority}`;
        let region = document.getElementById(id);
        
        if (!region) {
            region = document.createElement('div');
            region.id = id;
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', priority);
            region.setAttribute('aria-atomic', 'true');
            region.className = 'sr-only';
            document.body.appendChild(region);
        }
        
        return region;
    },
    
    // Manejar escape key para cerrar modales/drawers
    onEscape(callback) {
        const handler = (e) => {
            if (e.key === 'Escape') callback();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    },
    
    // Mejorar navegación con teclado en grids
    initGridKeyboardNavigation(gridSelector, itemSelector) {
        const grid = document.querySelector(gridSelector);
        if (!grid) return;
        
        grid.addEventListener('keydown', (e) => {
            const items = Array.from(grid.querySelectorAll(itemSelector));
            const currentIndex = items.indexOf(document.activeElement);
            
            if (currentIndex === -1) return;
            
            let nextIndex = currentIndex;
            const cols = Math.ceil(Math.sqrt(items.length)); // aprox
            
            switch (e.key) {
                case 'ArrowRight':
                    nextIndex = Math.min(currentIndex + 1, items.length - 1);
                    break;
                case 'ArrowLeft':
                    nextIndex = Math.max(currentIndex - 1, 0);
                    break;
                case 'ArrowDown':
                    nextIndex = Math.min(currentIndex + cols, items.length - 1);
                    break;
                case 'ArrowUp':
                    nextIndex = Math.max(currentIndex - cols, 0);
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = items.length - 1;
                    break;
                default:
                    return;
            }
            
            e.preventDefault();
            items[nextIndex]?.focus();
        });
    },
    
    // Validar contraste de colores (básico)
    checkContrast(fg, bg) {
        // Implementación simplificada - en producción usar biblioteca
        return true;
    }
};

// Inicializar navegación por teclado en grids
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityUtils.initGridKeyboardNavigation('.grid-marcas', '.marca-card');
    AccessibilityUtils.initGridKeyboardNavigation('.repuestos-grid', '.repuesto-item');
    AccessibilityUtils.initGridKeyboardNavigation('.tiktok-grid', '.tiktok-card');
    AccessibilityUtils.initGridKeyboardNavigation('.testimonios-grid', '.testimonio-card');
});

// ============================================
// ESTADO DE LA APLICACIÓN - ORIGINAL PRESERVADO
// ============================================

const state = {
    marca: '',
    modelo: '',
    anio: '',
    repuestosSeleccionados: [],
    
    reset() {
        this.marca = '';
        this.modelo = '';
        this.anio = '';
        this.repuestosSeleccionados = [];
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', ErrorHandler.safeHandler(() => {
    console.log('[App] DOMContentLoaded - Iniciando app principal');
    // Inicialización crítica (si falla, la app no funciona)
    const critical = [
        { fn: inicializarTema, name: 'tema' },
        { fn: inicializarAnios, name: 'años' },
        { fn: configurarHistorial, name: 'historial' },
        { fn: inicializarNavegacion, name: 'navegacion' }
    ];
    
    critical.forEach(({ fn, name }) => {
        try { fn(); } 
        catch (e) { ErrorHandler.handleError(e, { critical: true, initPhase: name }); }
    });
    
    // Efectos pesados (particulas, parallax, tilt, estela del cursor)
    // que en celulares vuelven lento el scroll del hero. En movil o con
    // "reducir movimiento" se omiten: el contenido queda identico.
    const movimientoReducido = window.matchMedia &&
        (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
         window.matchMedia('(max-width: 768px)').matches);

    // Inicialización no crítica (fallos no rompen la app)
    const nonCritical = [
        { fn: inicializarRecomendados, name: 'recomendados' },
        { fn: renderizarTikToks, name: 'tiktoks' },
        { fn: inicializarCookies, name: 'cookies' },
        { fn: initMenuMovil, name: 'menuMovil' },
        { fn: initFooterYear, name: 'footerYear' },
        { fn: initBotonResenaGoogle, name: 'botonResena' },
        { fn: CatalogoPdf.init, name: 'catalogoPdf' },
        { fn: initRedesSociales, name: 'redesSociales' },
        { fn: initScrollReveal, name: 'scrollReveal' },
        { fn: initCardTilt, name: 'cardTilt', pesado: true },
        { fn: initHeroTruckTilt, name: 'heroTilt', pesado: true },
        { fn: initParticles, name: 'particles', pesado: true },
        { fn: initCounters, name: 'counters' },
        { fn: initHeroParallax, name: 'heroParallax', pesado: true },
        { fn: initBeforeAfterSliders, name: 'beforeAfter' },
        { fn: initAntesDespuesParallax, name: 'parallax', pesado: true },
        { fn: initCursorTrail, name: 'cursorTrail', pesado: true }
    ];

    nonCritical.forEach(({ fn, name, pesado }) => {
        if (pesado && movimientoReducido) return;
        try { fn(); } 
        catch (e) { ErrorHandler.handleError(e, { initPhase: name }); }
    });
    
    actualizarEstadoHorario();
    setInterval(() => {
        try { actualizarEstadoHorario(); } 
        catch (e) { ErrorHandler.handleError(e, { initPhase: 'horario' }); }
    }, 60000);
}));

function inicializarRecomendados() {
    registerGlobal('inicializarRecomendados', inicializarRecomendados);
    registerGlobal('abrirCotizadorDestacado', abrirCotizadorDestacado);
    const track = document.getElementById('recomendadosTrack');
    if (!track) return;

    // Recolectar todos los repuestos del catálogo + los subidos desde el panel.
    // Se guarda tambien la CLAVE DE MODELO del catalogo: es la metadata que
    // permite abrir el cotizador preseleccionado (marca/modelo/año+producto).
    const todos = [];
    if (typeof CATALOGO !== 'undefined') {
        for (const marca of Object.keys(CATALOGO)) {
            const porMarca = CATALOGO[marca];
            for (const clave of Object.keys(porMarca)) {
                const lista = Array.isArray(porMarca[clave]) ? porMarca[clave] : [porMarca[clave]];
                lista.forEach(r => todos.push({ marca, modelo: clave, repuesto: r }));
            }
        }
    }
    const tieneExtra = typeof REPUESTOS_EXTRA !== 'undefined' && Array.isArray(REPUESTOS_EXTRA);
    if (tieneExtra) {
        REPUESTOS_EXTRA.forEach(r => todos.push({ marca: r.marca || 'Foton', repuesto: r }));
    }
    if (todos.length === 0) return;

    // Barajar en orden aleatorio
    for (let i = todos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [todos[i], todos[j]] = [todos[j], todos[i]];
    }

    // Garantizar variedad: al menos 2 productos de cada marca, luego el resto aleatorio
    const porMarca = {};
    todos.forEach(sel => {
        if (!porMarca[sel.marca]) porMarca[sel.marca] = [];
        porMarca[sel.marca].push(sel);
    });
    const elegidos = [];
    const marcas = Object.keys(porMarca);
    marcas.forEach(m => {
        porMarca[m].slice(0, 2).forEach(sel => elegidos.push(sel));
    });
    const restantes = [];
    todos.forEach(sel => {
        if (!elegidos.includes(sel)) restantes.push(sel);
    });
    restantes.forEach(sel => elegidos.push(sel));

    // Limitar a una cantidad razonable para que no pese la cinta
    const maxItems = Math.min(elegidos.length, 20);
    const listaFinal = elegidos.slice(0, maxItems);

    let html = '';

    listaFinal.forEach(sel => {
        const nombre = SecurityUtils.sanitizeAttribute(sel.repuesto.nombre);
        const img = SecurityUtils.sanitizeAttribute(sel.repuesto.img);
        const marca = SecurityUtils.sanitizeAttribute(sel.marca);
        const modelo = SecurityUtils.sanitizeAttribute(sel.modelo);
        const id = SecurityUtils.sanitizeAttribute(sel.repuesto.id);
        const anio = anioParaCotizar(sel.repuesto);

        // El clic abre el cotizador con marca/modelo/año ya elegidos y el
        // producto agregado. Es un <button> nativo: funciona con clic,
        // teclado y lector de pantalla sin JavaScript extra.
        html += `
            <button type="button" class="recomendado-item" data-id="${id}" data-marca="${marca}"
                    data-modelo="${modelo}" data-anio="${anio}" data-nombre="${nombre}"
                    onclick="abrirCotizadorDestacado(this)"
                    aria-label="Cotizar ${nombre} para ${marca} ${modelo}"
                    title="${nombre} - ${marca} ${modelo}">
                <span class="recomendado-img">
                    <img src="${img}" alt="${nombre}" loading="lazy" decoding="async"
                         onerror="this.parentElement.classList.add('img-error'); this.style.display='none';">
                </span>
                <span class="recomendado-nombre">${nombre}</span>
            </button>`;
    });

    // Duplicar para que el scroll infinito se vea continuo
    track.innerHTML = html + html;
}

// Año a preseleccionar para un repuesto: el primero de su rango si es un
// año valido del selector (1990..actual); si no, 'general' (sin filtrar).
// Nunca se inventa: sale de r.anios, la fuente real del catalogo.
function anioParaCotizar(repuesto) {
    try {
        const anios = repuesto && repuesto.anios;
        const desde = Array.isArray(anios) ? parseInt(anios[0]) : NaN;
        const actual = new Date().getFullYear();
        if (!isNaN(desde) && desde >= 1990 && desde <= actual) return String(desde);
    } catch (e) { /* cae a 'general' */ }
    return 'general';
}

// Busca un producto por id en las fuentes reales y devuelve su metadata
// completa para la cotizacion. Es la unica fuente de verdad: no se duplica
// informacion a mano en ningun otro sitio.
function resolverProductoCotizar(id) {
    if (!SecurityUtils.validateRepuestoId(id)) return null;
    if (typeof CATALOGO !== 'undefined') {
        for (const marca of Object.keys(CATALOGO)) {
            const porMarca = CATALOGO[marca];
            for (const modelo of Object.keys(porMarca)) {
                const lista = Array.isArray(porMarca[modelo]) ? porMarca[modelo] : [porMarca[modelo]];
                const r = lista.find(x => x && x.id === id);
                if (r) {
                    return {
                        id: String(r.id),
                        marca: String(marca),
                        modelo: String(modelo),
                        anio: anioParaCotizar(r),
                        nombre: String(r.nombre || id)
                    };
                }
            }
        }
    }
    if (typeof REPUESTOS_EXTRA !== 'undefined' && Array.isArray(REPUESTOS_EXTRA)) {
        const r = REPUESTOS_EXTRA.find(x => x && x.id === id);
        if (r && r.modelo && r.modelo !== '*') {
            return {
                id: String(r.id),
                marca: String(r.marca || ''),
                modelo: String(r.modelo),
                anio: anioParaCotizar(r),
                nombre: String(r.nombre || id)
            };
        }
    }
    return null;
}

// Clic en un producto destacado: abre el cotizador con marca, modelo y año
// ya elegidos y el producto agregado. El usuario no selecciona nada mas.
function abrirCotizadorDestacado(el) {
    registerGlobal('abrirCotizadorDestacado', abrirCotizadorDestacado);
    const id = el && el.dataset ? String(el.dataset.id || '') : '';
    const meta = resolverProductoCotizar(id);
    if (!meta) {
        mostrarNotificacion('No encontramos ese repuesto, elige tu marca', 'info');
        Navegacion.desplazarA('marcas');
        return;
    }
    if (typeof trackEvent === 'function') {
        trackEvent('click_producto_destacado', 'cotizador',
            meta.marca + '|' + meta.modelo + '|' + meta.anio + '|' + meta.nombre);
    }
    aplicarPreseleccionCotizador(meta, 'producto_destacado');
}

// Aplica marca/modelo/año al cotizador y agrega el producto si no estaba.
// Respeta el flujo normal: usa cargarConfigurador + los change de los
// selects (disparan validaciones, renders y tracking existentes), no pierde
// el historial (pushState como siempre) y no duplica el producto.
function aplicarPreseleccionCotizador(meta, origen) {
    registerGlobal('aplicarPreseleccionCotizador', aplicarPreseleccionCotizador);

    // Validar contra las fuentes reales antes de tocar la UI.
    const marcasValidas = (typeof DATA !== 'undefined' && DATA.modelos) ? Object.keys(DATA.modelos) : [];
    if (!marcasValidas.includes(meta.marca)) {
        mostrarNotificacion('Marca no disponible para cotizar en línea', 'error');
        return false;
    }
    if (!SecurityUtils.validateModelo(meta.marca, meta.modelo)) {
        mostrarNotificacion('Ese repuesto no tiene modelo disponible para cotizar en línea. Escríbenos por WhatsApp.', 'info');
        return false;
    }

    cargarConfigurador(meta.marca);
    if (typeof trackMarcaSeleccionada === 'function') trackMarcaSeleccionada(meta.marca);

    const selM = document.getElementById('modeloSelect');
    selM.value = meta.modelo;
    if (selM.value !== meta.modelo) {
        mostrarNotificacion('Ese modelo no está disponible para cotizar en línea. Escríbenos por WhatsApp.', 'info');
        return false;
    }
    selM.dispatchEvent(new Event('change', { bubbles: true }));

    const selA = document.getElementById('anioSelect');
    selA.value = meta.anio;
    if (selA.value !== meta.anio) selA.value = 'general';
    selA.dispatchEvent(new Event('change', { bubbles: true }));

    // Agregar sin duplicar (el sistema no maneja cantidades, solo presencia).
    if (!state.repuestosSeleccionados.includes(meta.id)) {
        state.repuestosSeleccionados.push(meta.id);
        trackRepuestoAgregado(meta.id, meta.nombre);
        if (typeof trackEvent === 'function') {
            trackEvent('producto_destacado_agregado', 'cotizador', meta.nombre + '|' + (origen || 'directo'), 1);
        }
        mostrarNotificacion('"' + meta.nombre + '" agregado a tu cotización', 'success');
    } else {
        mostrarNotificacion('Ese repuesto ya está en tu cotización', 'info');
    }
    renderizarRepuestos();
    actualizarResumen();

    // Mostrar al usuario el producto ya agregado: baja hasta el resumen.
    setTimeout(() => {
        const resumen = document.getElementById('listaResumen');
        if (resumen && resumen.scrollIntoView) resumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return true;
}

// NOTA: aqui vivia seleccionarRecomendado(), que solo preseleccionaba la
// marca. Quedo sin llamadas y se elimino: el flujo actual es
// abrirCotizadorDestacado(), que preselecciona marca+modelo+año y agrega
// el producto usando resolverProductoCotizar() como unica fuente.

function inicializarAnios() {
    const select = document.getElementById('anioSelect');
    const anioActual = new Date().getFullYear();
    
    // Opción "General": muestra todos los repuestos sin filtrar por año
    // Útil cuando el usuario no recuerda el año exacto de su camión.
    const optionGeneral = document.createElement('option');
    optionGeneral.value = 'general';
    optionGeneral.textContent = 'General (no recuerdo el año)';
    select.appendChild(optionGeneral);
    
    for (let i = anioActual; i >= 1990; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        select.appendChild(option);
    }
}

function configurarHistorial() {
    // NO se borra el hash de la URL: si el usuario llega con #faq, #marcas,
    // etc. (por ejemplo desde una pagina interna) hay que respetarlo.
    const seccion = (location.hash || '').replace('#', '');
    history.replaceState({ seccion: seccion || 'inicio' }, '', location.pathname + location.search + location.hash);

    // El boton "atras"/"adelante" solo cambia el scroll. Antes se llamaba a
    // mostrarPantalla('inicio'), que ademas hacia scroll a #marcas, y por eso
    // varios enlaces del menu terminaban en el mismo sitio.
    window.addEventListener('popstate', () => {
        Navegacion.aplicarHashActual(false);
    });
    window.addEventListener('hashchange', () => {
        Navegacion.aplicarHashActual(false);
    });
}

// ============================================
// COOKIES
// ============================================

function inicializarCookies() {
    const aceptadas = localStorage.getItem('cookiesAceptadas');
    const banner = document.getElementById('cookieBanner');
    
    if (!aceptadas) {
        setTimeout(() => {
            banner.classList.add('mostrar');
        }, 1000);
    }
}

function aceptarCookies() {
    registerGlobal('aceptarCookies', aceptarCookies);
    localStorage.setItem('cookiesAceptadas', 'true');
    document.getElementById('cookieBanner').classList.remove('mostrar');
    mostrarNotificacion('Cookies aceptadas. ¡Gracias!', 'success');
}

function rechazarCookies() {
    registerGlobal('rechazarCookies', rechazarCookies);
    localStorage.setItem('cookiesAceptadas', 'false');
    document.getElementById('cookieBanner').classList.remove('mostrar');
    mostrarNotificacion('Has rechazado las cookies', 'error');
}

// ============================================
// TEMA OSCURO / CLARO
// ============================================

function toggleTema() {
    registerGlobal('toggleTema', toggleTema);
    const html = document.documentElement;
    const esOscuro = html.getAttribute('data-theme') === 'dark';
    if (esOscuro) {
        html.removeAttribute('data-theme');
        localStorage.setItem('tema', 'claro');
    } else {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('tema', 'oscuro');
    }
    actualizarIconoTema();
    mostrarNotificacion(esOscuro ? 'Modo claro activado' : 'Modo oscuro activado', 'success');
}

function actualizarIconoTema() {
    const icono = document.getElementById('temaIcono');
    if (!icono) return;
    const esOscuro = document.documentElement.getAttribute('data-theme') === 'dark';
    icono.textContent = esOscuro ? '☀️' : '🌙';
}

function inicializarTema() {
    // El sitio inicia siempre en modo claro.
    // Solo se aplica oscuro si el usuario lo eligió explícitamente.
    const guardado = localStorage.getItem('tema');

    if (guardado === 'oscuro') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    actualizarIconoTema();
}

// ============================================
// TIKTOK - TRABAJOS REALIZADOS
// ============================================
// Metodo de embed: bloque oficial de TikTok (<blockquote class="tiktok-embed">
// + https://www.tiktok.com/embed.js), que es el que TikTok documenta hoy.
//
// Por que antes se veia negro:
//   1. se usaba el endpoint viejo /embed/v2/{id}, ya retirado;
//   2. el iframe llevaba sandbox="allow-scripts allow-same-origin allow-forms
//      allow-popups", y el reproductor oficial necesita mas capacidades
//      (acceso a almacenamiento y a la politica de reproduccion), por lo que
//      se quedaba en negro;
//   3. se pedia autoplay=1, que los navegadores bloquean sin gesto del
//      usuario y hacia fallar la carga inicial.
//   4. no existia alternativa: si el iframe fallaba, la caja se quedaba negra.
//
// Ahora: se pinta una tarjeta propia con la miniatura REAL del video, su
// titulo REAL y el boton "Ver en TikTok". El reproductor oficial se monta
// encima y solo se vuelve visible cuando carga. Si no carga (cookies, WAF de
// TikTok, sin conexion, sin consentimiento), la tarjeta sigue mostrando la
// miniatura y el enlace: nunca queda una caja negra.

function renderizarTikToks() {
    registerGlobal('renderizarTikToks', renderizarTikToks);
    const container = document.getElementById('tiktokContainer');
    if (!container) return;

    if (DATA.tiktoks.length === 0) {
        container.innerHTML = `
            <div class="tiktok-empty">
                <div class="tiktok-empty-icon">🎵</div>
                <h3>Próximamente</h3>
                <p>Estamos preparando contenido exclusivo de nuestros trabajos.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    DATA.tiktoks.forEach(video => {
        const videoId = SecurityUtils.sanitizeAttribute(video.videoId || '');
        const url = SecurityUtils.sanitizeAttribute(video.url);
        const miniatura = SecurityUtils.sanitizeAttribute(video.imagen);

        // Titulo real traido de la API oficial oEmbed de TikTok.
        const oembed = (typeof TIKTOK_OEMBED !== 'undefined') ? TIKTOK_OEMBED[videoId] : null;
        const titulo = oembed && oembed.titulo ? oembed.titulo : (SecurityUtils.sanitizeHTML(video.titulo) || '');
        const enlace = (oembed && oembed.url) ? oembed.url : url;
        const imagenReal = (oembed && oembed.imagen) ? oembed.imagen : miniatura;

        const tarjeta = document.createElement('article');
        tarjeta.className = 'tiktok-card';
        tarjeta.setAttribute('data-tiktok-id', videoId);

        tarjeta.innerHTML = `
            <div class="tiktok-video tiktok-video--con-fallback">
                <!-- Fachada: miniatura real + boton de reproducir. El
                     reproductor pesado de TikTok NO se carga hasta que el
                     usuario toca reproducir (ahorra datos y no bloquea el
                     render inicial). Si TikTok falla, queda la miniatura
                     con el enlace directo, como siempre. -->
                <div class="tiktok-fallback">
                    <img class="tiktok-miniatura" src="${imagenReal}" alt="${SecurityUtils.sanitizeAttribute(titulo || 'Video de trabajos en camiones')}"
                         loading="lazy" decoding="async"
                         onerror="this.parentElement.classList.add('sin-miniatura'); this.style.display='none';">
                    <button type="button" class="tiktok-miniatura-link tiktok-play-btn" data-video-id="${videoId}"
                            onclick="reproducirTikTok('${videoId}', this)"
                            aria-label="Reproducir video de TikTok${titulo ? ': ' + SecurityUtils.sanitizeAttribute(titulo.slice(0, 60)) : ''}">
                        <span class="tiktok-play" aria-hidden="true">&#9654;</span>
                        <span class="tiktok-miniatura-cta">Ver video</span>
                    </button>
                </div>
                <!-- El reproductor oficial se monta aqui SOLO al reproducir -->
                <div class="tiktok-embed-mount" data-video-id="${videoId}">
                </div>
            </div>
            <div class="tiktok-info-lower">
                <div class="tiktok-info">
                    ${titulo ? `<div class="tiktok-titulo">${SecurityUtils.sanitizeHTML(titulo)}</div>` : ''}
                    <div class="tiktok-stats">
                        <a href="${enlace}" target="_blank" rel="noopener noreferrer" class="tiktok-abrir" onclick="trackTikTokClick('${videoId}')">Ver en TikTok &#8599;</a>
                    </div>
                </div>
            </div>
            <div class="tiktok-badge">TikTok</div>
        `;

        container.appendChild(tarjeta);
    });

    // Fachada: embed.js NO se carga al inicio. Solo cuando el usuario toca
    // reproducir en alguna tarjeta (ver reproducirTikTok).
}

// Carga el script oficial de TikTok una sola vez.
let _embedTikTokCargado = false;
function _asegurarEmbedTikTok() {
    if (_embedTikTokCargado) return;
    _embedTikTokCargado = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.tiktok.com/embed.js';
    s.onerror = () => {
        console.warn('[TikTok] No se pudo cargar embed.js. Se mantiene la miniatura con el enlace a TikTok.');
    };
    document.head.appendChild(s);
}

// Reproduce un video dentro de su tarjeta. Se llama desde el boton de
// reproducir de cada fachada (clic o teclado). Si el reproductor ya esta
// montado, no hace nada. Si TikTok esta bloqueado, la miniatura y el
// enlace "Ver en TikTok" siguen ahi: nunca hay un recuadro vacio.
function reproducirTikTok(videoId, boton) {
    registerGlobal('reproducirTikTok', reproducirTikTok);
    try {
        const card = boton ? boton.closest('.tiktok-card') : document.querySelector(`.tiktok-card[data-tiktok-id="${videoId}"]`);
        if (!card || card.classList.contains('tiktok-player-listo') || card.dataset.tiktokMontando === '1') return;
        const mount = card.querySelector('.tiktok-embed-mount');
        if (!mount) return;
        card.dataset.tiktokMontando = '1';

        const enlace = 'https://www.tiktok.com/@lujosyaccesorioscamiones/video/' + videoId;
        mount.innerHTML = `
            <blockquote class="tiktok-embed"
                        cite="${enlace}"
                        data-video-id="${videoId}"
                        data-embed-from="oembed"
                        style="max-width:605px;min-width:325px;">
                <section></section>
            </blockquote>`;

        _asegurarEmbedTikTok();
        if (window.tiktok && typeof window.tiktok.parseEmbeds === 'function') {
            try { window.tiktok.parseEmbeds(); } catch (e) { /* no critico */ }
        }

        if (typeof trackEvent === 'function') trackEvent('tiktok_play', 'social', videoId);

        // Vigilancia solo de esta tarjeta: se revela cuando TikTok inyecta
        // el IFRAME real. Si no llega en 15 s (bloqueo/WAF/sin red), se
        // permite reintentar tocando de nuevo.
        const begun = Date.now();
        const esperar = setInterval(() => {
            if (mount.querySelector('iframe')) {
                card.classList.add('tiktok-player-listo');
                clearInterval(esperar);
                return;
            }
            if (Date.now() - begun > 15000) {
                delete card.dataset.tiktokMontando;
                clearInterval(esperar);
            }
        }, 500);
    } catch (e) {
        if (typeof ErrorHandler !== 'undefined' && ErrorHandler.handleError) {
            ErrorHandler.handleError(e, { fn: 'reproducirTikTok' });
        }
    }
}

// ============================================
// FAQ - PREGUNTAS FRECUENTES
// ============================================

function toggleFaq(button) {
    registerGlobal('toggleFaq', toggleFaq);
    const item = button.closest('.faq-item');
    const isActive = item.classList.contains('activo');
    
    // Cerrar todos los demás
    document.querySelectorAll('.faq-item.activo').forEach(faq => {
        if (faq !== item) {
            faq.classList.remove('activo');
        }
    });
    
    // Toggle el actual
    item.classList.toggle('activo');
}

// ============================================
// NAVEGACIÓN - ORIGINAL PRESERVADO
// ============================================

function scrollToMarcas() {
    registerGlobal('scrollToMarcas', scrollToMarcas);
    mostrarPantalla('inicio');
    history.pushState({ pantalla: 'inicio', seccion: 'marcas' }, '', '#marcas');
    Navegacion.desplazarA('marcas');
    Navegacion.marcarActivo('marcas');
}

function scrollToTrabajos() {
    registerGlobal('scrollToTrabajos', scrollToTrabajos);
    history.pushState({ seccion: 'trabajos' }, '', '#trabajos');
    Navegacion.desplazarA('trabajos');
    Navegacion.marcarActivo('trabajos');
}

function scrollToResultados() {
    registerGlobal('scrollToResultados', scrollToResultados);
    history.pushState({ seccion: 'resultados' }, '', '#resultados');
    // Antes caia en #marcas cuando #resultados no existia. Ahora solo se
    // recurren a la seccion de resultados.
    if (!Navegacion.desplazarA('resultados')) {
        mostrarNotificacion('La sección Antes y Después aún no está disponible', 'info');
    }
    Navegacion.marcarActivo('resultados');
}

function seleccionarMarca(marca) {
    registerGlobal('seleccionarMarca', seleccionarMarca);
    reproducirSonidoMarca();
    mostrarAnimacionCamion(marca);
}

// Sonido de encendido de camion al seleccionar una marca.
// Una sola instancia compartida: al elegir otra marca se reinicia desde
// el principio en vez de superponerse. Como siempre nace de un clic o
// tecla del usuario, el navegador lo permite; si igual falla (autoplay,
// sin audio, archivo ausente), no rompe la seleccion ni avisa al usuario.
let _audioMarca = null;
function reproducirSonidoMarca() {
    registerGlobal('reproducirSonidoMarca', reproducirSonidoMarca);
    try {
        if (!_audioMarca) {
            _audioMarca = new Audio('sonido al seleccionar marcas/encendido de camion.mp3');
            _audioMarca.preload = 'auto';
        }
        _audioMarca.pause();
        _audioMarca.currentTime = 0;
        const promesa = _audioMarca.play();
        if (promesa && typeof promesa.catch === 'function') {
            promesa.catch(() => { /* autoplay bloqueado: la seleccion sigue igual */ });
        }
    } catch (e) { /* sin audio no se rompe nada */ }
}

function volverAMarcas() {
    registerGlobal('volverAMarcas', volverAMarcas);
    history.pushState({ pantalla: 'inicio', seccion: 'marcas' }, '', '#marcas');
    mostrarPantalla('inicio');
    state.reset();
    Navegacion.desplazarA('marcas');
    Navegacion.marcarActivo('marcas');
}

function volverInicio() {
    registerGlobal('volverInicio', volverInicio);
    // Ir al principio real de la pagina. Antes, si habia una marca
    // seleccionada, llamaba a volverAMarcas() y terminaba en #marcas.
    history.pushState({ pantalla: 'inicio', seccion: 'inicio' }, '', '#inicio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Navegacion.marcarActivo('inicio');
}

// ============================================
// NAVEGACIÓN CENTRALIZADA
// ============================================
// Un unico punto de control decide a donde lleva cada entrada del menu,
// tanto en la home como desde una pagina interna SEO.
//
// Problema que corrige:
//   - mostrarPantalla() hacia scroll a #marcas en cuanto se llamaba,
//     y el listener de popstate la llamaba siempre. Por eso "Inicio",
//     "Productos" y "Marcas" acababan en el mismo sitio.
//   - el enlace de Cotizador arrastraba ese comportamiento al resto del menu.

const Navegacion = (() => {
    // Mapeo obligatorio: cada entrada del menu -> su seccion real.
    const SECCIONES = {
        inicio:       'inicio',
        recomendados: 'recomendados', // Productos
        'catalogo-pdf': 'catalogo-pdf', // Catalogo PDF (seccion propia)
        marcas:       'marcas',
        configurador: 'configurador', // Cotizador
        trabajos:     'trabajos',
        resultados:   'resultados',   // Antes y Despues
        testimonios:  'testimonios',  // Resenas
        faq:          'faq',
        ubicacion:    'ubicacion'     // Contacto
    };

    // Solo el cotizador manipula la vista marcas/configurador.
    const SOLO_CONFIGURADOR = 'configurador';

    // El header es fijo: se descuenta su alto para que la seccion quede
    // justo debajo y no tapada.
    function offsetHeader() {
        const header = document.querySelector('header');
        if (!header) return 0;
        const estilos = getComputedStyle(header);
        if (estilos.position !== 'fixed' && estilos.position !== 'sticky') return 0;
        return header.offsetHeight;
    }

    function esHome() {
        return !!document.getElementById('inicio') && !!document.getElementById('navPrincipal');
    }

    // Ruta RELATIVA a la home, calculada desde la pagina actual.
    // Nunca se hardcodea una ruta absoluta de Windows ni del servidor.
    function rutaHome() {
        const base = document.querySelector('base[href]');
        if (base) return base.getAttribute('href');
        // app.js solo se carga en la home, asi que aqui siempre es relative
        return location.pathname.replace(/[^/]*$/, '');
    }

    function elemento(seccion) {
        return document.getElementById(SECCIONES[seccion] || seccion);
    }

    // Mueve el foco de la vista al elemento correcto antes de hacer scroll,
    // para que el configurador quede visible cuando se pide.
    function prepararVista(seccion) {
        if (seccion !== SOLO_CONFIGURADOR) return;
        const marcas = document.getElementById('marcas');
        const config = document.getElementById('configurador');
        if (marcas && config) {
            marcas.style.display = 'none';
            config.style.display = 'block';
            config.classList.add('fade-in');
        }
    }

    function desplazarA(seccion) {
        const destino = elemento(seccion);
        if (!destino) return false;
        const top = destino.getBoundingClientRect().top + window.pageYOffset - offsetHeader() - 8;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        return true;
    }

    // Aplica el hash que ya hay en la URL. Se usa al cargar la pagina y
    // en atras/adelante.
    function aplicarHashActual(animar) {
        const seccion = (location.hash || '').replace('#', '');
        if (!seccion) return;
        // Enlace profundo de cotizacion: index.html#cotizar-<id-producto>.
        // Lo usan los botones "Cotizar" de las paginas SEO y cualquier
        // enlace compartido. Abre el cotizador preseleccionado.
        if (seccion.indexOf('cotizar-') === 0) {
            const meta = resolverProductoCotizar(seccion.slice('cotizar-'.length));
            if (meta) {
                aplicarPreseleccionCotizador(meta, 'enlace');
            } else {
                mostrarNotificacion('No encontramos ese repuesto, elige tu marca', 'info');
                mostrarPantalla('inicio');
                desplazarA('marcas');
            }
            return;
        }
        const id = SECCIONES[seccion] || seccion;
        if (id === SOLO_CONFIGURADOR) {
            prepararVista(id);
            if (!state.marca) {
                mostrarNotificacion('Elige primero la marca de tu camión', 'info');
                mostrarPantalla('inicio');
                return desplazarA('marcas');
            }
        }
        // Igual que en irA(): al volver con el boton de atras a #marcas hay que
        // volver a mostrarla, porque con el configurador abierto esta oculta.
        if (id === 'marcas') mostrarPantalla('inicio');
        if (!animar) {
            const destino = elemento(id);
            if (!destino) return;
            const top = destino.getBoundingClientRect().top + window.pageYOffset - offsetHeader() - 8;
            window.scrollTo({ top: Math.max(top, 0), behavior: 'auto' });
        } else {
            desplazarA(id);
        }
        marcarActivo(seccion);
    }

    function marcarActivo(seccion) {
        document.querySelectorAll('#navPrincipal .nav-link[data-seccion]').forEach(link => {
            link.classList.toggle('nav-link-activo', link.dataset.seccion === seccion);
        });
    }

    // Entrada principal. Se engancha a los <a data-seccion> del menu.
    function irA(seccion, opciones = {}) {
        const id = SECCIONES[seccion] || seccion;

        if (!esHome()) {
            // Desde una pagina interna se vuelve a la home con el ancla.
            // rutaHome() es relativa, funciona en local, GitHub Pages y dominio.
            location.href = rutaHome() + 'index.html#' + id;
            return;
        }

        if (opciones.actualizarUrl !== false) {
            history.pushState({ seccion: seccion }, '', '#' + id);
        }

        if (id === SOLO_CONFIGURADOR) {
            if (!state.marca) {
                mostrarNotificacion('Elige primero la marca de tu camión', 'info');
                history.replaceState({ seccion: seccion }, '', '#marcas');
                marcarActivo('marcas');
                // Hay que volver a mostrar la seccion de marcas: si el
                // configurador estaba abierto esta en display:none y el
                // scroll no arrive a nada visible.
                mostrarPantalla('inicio');
                desplazarA('marcas');
                return;
            }
            mostrarPantalla('configurador', { scroll: false });
            AccessibilityUtils.saveFocus();
            prepararVista(id);
            desplazarA(id);
            setTimeout(() => {
                const modeloSelect = document.getElementById('modeloSelect');
                if (modeloSelect) modeloSelect.focus();
                AccessibilityUtils.announce('Configurador de cotización cargado. Selecciona el modelo de tu camión.');
            }, 120);
        } else {
            // Cualquier seccion que no sea el cotizador: solo scroll.
            //
            // Excepcion: "Marcas" puede estar oculta (display:none) cuando el
            // configurador esta abierto. Sin volver a mostrarla el enlace
            // "Marcas" del menu nooria que pasar. mostrarPantalla('inicio')
            // no hace scroll, asi que el orden es: mostrar y luego desplazar.
            if (id === 'marcas') mostrarPantalla('inicio');
            desplazarA(id);
            marcarActivo(seccion);
        }
    }

    function init() {
        if (!esHome()) return;
        const nav = document.getElementById('navPrincipal');
        if (!nav) return;

        // Delegacion: un solo listener para todo el menu, mas el logo.
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-seccion]');
            if (!link) return;
            e.preventDefault();
            const seccion = link.dataset.seccion;
            trackNavegacionMenu(link.dataset.nombre || (link.textContent || '').trim());
            irA(seccion);
        });

        // Al cargar con #ancla (por ejemplo desde una pagina interna)
        aplicarHashActual(false);
        marcarActivo((location.hash || '#inicio').replace('#', '') || 'inicio');
    }

    return { SECCIONES, init, irA, aplicarHashActual, esHome, rutaHome, marcarActivo, desplazarA };
})();

function inicializarNavegacion() {
    registerGlobal('inicializarNavegacion', inicializarNavegacion);
    Navegacion.init();
}

function mostrarPantalla(pantalla) {
    registerGlobal('mostrarPantalla', mostrarPantalla);
    const marcasSection = document.getElementById('marcas');
    const configurador = document.getElementById('configurador');
    if (!marcasSection || !configurador) return;

    // No se hace scroll aqui. Antes esta funcion hacia scroll a #marcas cada
    // vez que se llamaba, y eso hacia que casi todos los enlaces del menu
    // terminaran en la seccion de marcas.
    if (pantalla === 'configurador') {
        marcasSection.style.display = 'none';
        configurador.style.display = 'block';
        configurador.classList.add('fade-in');
    } else {
        configurador.style.display = 'none';
        marcasSection.style.display = 'block';
        AccessibilityUtils.restoreFocus();
    }
}

function cargarModelos(marca) {
    const select = document.getElementById('modeloSelect');
    select.innerHTML = '<option value="">Selecciona el modelo</option>';
    
    DATA.modelos[marca].forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo;
        option.textContent = modelo;
        select.appendChild(option);
    });
    
    select.onchange = (e) => {
        state.modelo = e.target.value;
        state.repuestosSeleccionados = [];
        renderizarRepuestos();
        actualizarResumen();
        if (state.modelo) trackModeloSeleccionado(state.modelo);
    };
    
    document.getElementById('anioSelect').onchange = (e) => {
        state.anio = e.target.value;
        renderizarRepuestos();
        if (state.anio) trackAnioSeleccionado(state.anio);
    };
}

// ============================================
// SONIDO DEL MOTOR - ORIGINAL PRESERVADO
// ============================================

let audioContext = null;
let motorNodes = [];

function iniciarSonidoMotor() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioContext.currentTime;
        const dur = 2;
        const idleRpm = 27;

        // Arranque: pitch sube de ~18Hz (crank) a 27Hz (ralentí)
        const osc1 = audioContext.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(18, now);
        osc1.frequency.linearRampToValueAtTime(idleRpm + 3, now + 0.35);
        osc1.frequency.linearRampToValueAtTime(idleRpm, now + 0.6);
        osc1.frequency.setValueAtTime(idleRpm, now + dur);

        // Pequeña vibración irregular del ralentí (LFO sobre frecuencia)
        const vibrato = audioContext.createOscillator();
        vibrato.type = 'sine';
        vibrato.frequency.setValueAtTime(6.5, now);
        const vibratoGain = audioContext.createGain();
        vibratoGain.gain.setValueAtTime(0, now);
        vibratoGain.gain.linearRampToValueAtTime(2.5, now + 0.7);
        vibratoGain.gain.setValueAtTime(2.5, now + dur);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc1.frequency);
        vibrato.start(now);

        // 2da armónica (54 Hz)
        const osc2 = audioContext.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(36, now);
        osc2.frequency.linearRampToValueAtTime(54, now + 0.5);
        osc2.frequency.setValueAtTime(54, now + dur);

        // 3ra armónica (81 Hz) para el "growl" diesel
        const osc3 = audioContext.createOscillator();
        osc3.type = 'triangle';
        osc3.frequency.setValueAtTime(54, now);
        osc3.frequency.linearRampToValueAtTime(81, now + 0.5);
        osc3.frequency.setValueAtTime(81, now + dur);

        // Subgrave profundo (13.5 Hz)
        const oscSub = audioContext.createOscillator();
        oscSub.type = 'sine';
        oscSub.frequency.setValueAtTime(9, now);
        oscSub.frequency.linearRampToValueAtTime(13.5, now + 0.5);
        oscSub.frequency.setValueAtTime(13.5, now + dur);

        // Ruido de escape filtrado
        const bufSize = audioContext.sampleRate * 0.5;
        const buf = audioContext.createBuffer(1, bufSize, audioContext.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioContext.createBufferSource();
        noise.buffer = buf;
        noise.loop = true;

        const noiseBP = audioContext.createBiquadFilter();
        noiseBP.type = 'bandpass';
        noiseBP.frequency.setValueAtTime(180, now);
        noiseBP.Q.setValueAtTime(0.8, now);

        // "Clatter" diesel: ráfagas cortas de ruido de alta frecuencia
        const clatterBuf = audioContext.createBuffer(1, bufSize, audioContext.sampleRate);
        const cData = clatterBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
            cData[i] = (Math.random() > 0.995) ? (Math.random() * 2 - 1) * 0.6 : 0;
        }
        const clatter = audioContext.createBufferSource();
        clatter.buffer = clatterBuf;
        clatter.loop = true;

        const clatterHP = audioContext.createBiquadFilter();
        clatterHP.type = 'highpass';
        clatterHP.frequency.setValueAtTime(800, now);

        // Gains
        const g1 = audioContext.createGain();
        g1.gain.setValueAtTime(0, now);
        g1.gain.linearRampToValueAtTime(0.18, now + 0.4);
        g1.gain.setValueAtTime(0.18, now + dur - 0.3);
        g1.gain.linearRampToValueAtTime(0, now + dur);

        const g2 = audioContext.createGain();
        g2.gain.setValueAtTime(0, now);
        g2.gain.linearRampToValueAtTime(0.06, now + 0.45);
        g2.gain.setValueAtTime(0.06, now + dur - 0.3);
        g2.gain.linearRampToValueAtTime(0, now + dur);

        const g3 = audioContext.createGain();
        g3.gain.setValueAtTime(0, now);
        g3.gain.linearRampToValueAtTime(0.04, now + 0.5);
        g3.gain.setValueAtTime(0.04, now + dur - 0.3);
        g3.gain.linearRampToValueAtTime(0, now + dur);

        const gSub = audioContext.createGain();
        gSub.gain.setValueAtTime(0, now);
        gSub.gain.linearRampToValueAtTime(0.14, now + 0.5);
        gSub.gain.setValueAtTime(0.14, now + dur - 0.3);
        gSub.gain.linearRampToValueAtTime(0, now + dur);

        const gNoise = audioContext.createGain();
        gNoise.gain.setValueAtTime(0, now);
        gNoise.gain.linearRampToValueAtTime(0.045, now + 0.5);
        gNoise.gain.setValueAtTime(0.045, now + dur - 0.3);
        gNoise.gain.linearRampToValueAtTime(0, now + dur);

        const gClatter = audioContext.createGain();
        gClatter.gain.setValueAtTime(0, now);
        gClatter.gain.linearRampToValueAtTime(0.06, now + 0.6);
        gClatter.gain.setValueAtTime(0.06, now + dur - 0.3);
        gClatter.gain.linearRampToValueAtTime(0, now + dur);

        const masterFilter = audioContext.createBiquadFilter();
        masterFilter.type = 'lowpass';
        masterFilter.frequency.setValueAtTime(120, now);
        masterFilter.frequency.linearRampToValueAtTime(450, now + 0.6);
        masterFilter.frequency.linearRampToValueAtTime(380, now + 1.2);
        masterFilter.frequency.setValueAtTime(380, now + dur - 0.3);
        masterFilter.frequency.linearRampToValueAtTime(100, now + dur);

        const masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
        masterGain.gain.setValueAtTime(0.45, now + 0.5);
        masterGain.gain.linearRampToValueAtTime(0.7, now + 0.8);
        masterGain.gain.setValueAtTime(0.7, now + dur - 0.4);
        masterGain.gain.linearRampToValueAtTime(0, now + dur);

        osc1.connect(g1);
        osc2.connect(g2);
        osc3.connect(g3);
        oscSub.connect(gSub);
        noise.connect(noiseBP);
        noiseBP.connect(gNoise);
        clatter.connect(clatterHP);
        clatterHP.connect(gClatter);

        g1.connect(masterFilter);
        g2.connect(masterFilter);
        g3.connect(masterFilter);
        gSub.connect(masterFilter);
        gNoise.connect(masterFilter);
        gClatter.connect(masterFilter);

        masterFilter.connect(masterGain);
        masterGain.connect(audioContext.destination);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);
        oscSub.start(now);
        noise.start(now);
        clatter.start(now);

        motorNodes = [osc1, osc2, osc3, oscSub, noise, clatter, vibrato];

        setTimeout(() => {
            detenerSonidoMotor();
        }, dur * 1000);

    } catch (e) {
        console.log('Audio no soportado:', e.message);
    }
}

function detenerSonidoMotor() {
    if (!audioContext || motorNodes.length === 0) return;
    
    const now = audioContext.currentTime;
    
    motorNodes.forEach(node => {
        try {
            if (node.stop) node.stop(now + 0.1);
        } catch (e) {}
    });
    
    setTimeout(() => {
        if (audioContext) {
            audioContext.close();
            audioContext = null;
            motorNodes = [];
        }
    }, 200);
}

// ============================================
// ANIMACIÓN DEL CAMIÓN - ORIGINAL PRESERVADO
// ============================================

function mostrarAnimacionCamion(marca) {
    const overlay = document.getElementById('animacionCamion');
    const camion = document.getElementById('camionAnimado');
    const texto = document.getElementById('animacionCamionTexto');

    const imagenes = {
        Chevrolet: 'img/animaciones/chevrolet.png',
        JAC: 'img/animaciones/jac.png',
        Foton: 'img/animaciones/foton.png',
        JMC: 'img/animaciones/jmc.png'
    };

    const rutaImagen = imagenes[marca] || 'img/animaciones/camion-generico.png';
    camion.src = rutaImagen;
    camion.classList.toggle('camion-foton', marca === 'Foton');
    texto.textContent = `Cargando ${marca}...`;
    
    iniciarSonidoMotor();
    
    overlay.classList.add('activo');
    
    requestAnimationFrame(() => {
        overlay.classList.add('animar');
    });
    
    setTimeout(() => {
        overlay.classList.remove('activo');
        overlay.classList.remove('animar');
        cargarConfigurador(marca);
    }, 2000);
}

function cargarConfigurador(marca) {
    registerGlobal('cargarConfigurador', cargarConfigurador);
    // Validación de entrada
    const marcasValidas = Object.keys(DATA.modelos);
    if (!marcasValidas.includes(marca)) {
        ErrorHandler.handleError(new Error(`Marca inválida: ${marca}`), { critical: true, fn: 'cargarConfigurador' });
        mostrarNotificacion('Marca no válida', 'error');
        return;
    }
    
    // Sanitizar para CSP
    const marcaSegura = SecurityUtils.sanitizeAttribute(marca);
    
    state.marca = marcaSegura;
    state.repuestosSeleccionados = [];
    
    history.pushState(
        { pantalla: 'configurador' },
        '',
        `#${marcaSegura.toLowerCase()}`
    );
    
    document.getElementById('marcaDisplay').textContent = marcaSegura;
    document.getElementById('breadcrumbText').textContent = marcaSegura;
    
    cargarModelos(marcaSegura);
    renderizarRepuestos();
    actualizarResumen();
    
    mostrarPantalla('configurador');
    
    // Scroll to model/year selection instead of top
    setTimeout(() => {
        const modeloSelect = document.getElementById('modeloSelect');
        if (modeloSelect) {
            modeloSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
    
    trackMarcaSeleccionada(marcaSegura);
    mostrarNotificacion(`Has seleccionado ${marcaSegura}`, 'success');
}

// ============================================
// REPUESTOS - ORIGINAL PRESERVADO
// ============================================

// Devuelve los repuestos del catalogo para la marca/modelo/año seleccionados.
// Las carpetas de img/repuestos pueden aplicar a un modelo específico o a
// toda la marca (clave con el nombre de la marca), y tener rango de años.
function obtenerRepuestosActuales() {
    let lista = [];

    // ---- Repuestos del catálogo generado ----
    if (typeof CATALOGO !== 'undefined' && state.marca && state.modelo) {
        // Buscar la clave real del catálogo sin importar mayúsculas/minúsculas.
        // El catálogo usa "Jac"/"Jmc" pero la marca seleccionada es "JAC"/"JMC".
        const claveCatalogo = Object.keys(CATALOGO).find(c => c.toLowerCase() === state.marca.toLowerCase());
        const porMarca = claveCatalogo ? CATALOGO[claveCatalogo] : undefined;
        if (porMarca) {
            // Mostrar SOLO los repuestos del modelo seleccionado.
            // El catálogo tiene una clave por cada modelo específico (NHR, FRR, OLLIN, POWER, ...)
            // y también puede tener una clave con el nombre de la marca para repuestos generales.
            const claveModelo = Object.keys(porMarca).find(
                c => c.toLowerCase() === state.modelo.toLowerCase()
            ) || Object.keys(porMarca).find(
                c => c.toLowerCase() === state.marca.toLowerCase()
            );
            if (claveModelo) {
                const delModelo = Array.isArray(porMarca[claveModelo]) ? porMarca[claveModelo] : [porMarca[claveModelo]];
                lista = lista.concat(delModelo);
            }
        }
    }

    // ---- Repuestos subidos desde el panel de administración ----
    // Se guardan en js/catalogo-extra.js como window.REPUESTOS_EXTRA
    if (typeof REPUESTOS_EXTRA !== 'undefined' && Array.isArray(REPUESTOS_EXTRA) && state.marca) {
        REPUESTOS_EXTRA.forEach(r => {
            // Deben coincidir con la marca seleccionada
            const marcaExtra = (r.marca || '').toLowerCase();
            const marcaSel = state.marca.toLowerCase();
            if (marcaExtra !== marcaSel) return;
            // Si define modelo, debe coincidir con el seleccionado (o aplica a todos)
            const modeloExtra = r.modelo || '*';
            if (modeloExtra !== '*' && modeloExtra.toLowerCase() !== (state.modelo || '').toLowerCase()) return;
            lista.push(r);
        });
    }

    // ---- Fallback ----
    if (lista.length === 0 && (typeof CATALOGO === 'undefined' || !state.marca)) {
        return DATA.repuestos;
    }

    // ---- Filtro por año (respetando el rango de cada repuesto) ----
    // state.anio === 'general'  -> mostrar todos sin filtrar.
    // state.anio numérico       -> filtrar por rango (solo la carpeta del año).
    if (lista.length && state.anio !== 'general') {
        const anioSel = parseInt(state.anio);
        if (!isNaN(anioSel)) {
            return lista.filter(r => {
                if (!r.anios) return true;
                const desde = r.anios[0];
                const hasta = r.anios[1];
                if (desde != null && anioSel < desde) return false;
                if (hasta != null && anioSel > hasta) return false;
                return true;
            });
        }
    }
    return lista;
}

function renderizarRepuestos() {
    const container = document.getElementById('repuestosContainer');
    container.innerHTML = '';
    
    const titulo = document.getElementById('repuestosTitulo');
    
    // El modelo y el año son obligatorios para mostrar el catálogo.
    // El año puede ser un valor numérico o "General" (valor 'general').
    // En Chevrolet el año es indispensable porque filtra por rango exacto;
    // en el resto de marcas basta con elegir cualquier año o "General".
    if (!state.modelo) {
        if (titulo) titulo.textContent = 'Completa los datos de tu camión';
        container.innerHTML = '<p class="empty-state">⬆️ Selecciona el modelo de tu camión para ver los repuestos disponibles.</p>';
        return;
    }
    
    const esAnioGeneral = state.anio === 'general';
    const anioNumerico = parseInt(state.anio);
    const tieneAnio = esAnioGeneral || (!isNaN(anioNumerico) && state.anio !== '');
    if (!tieneAnio) {
        if (titulo) titulo.textContent = 'Selecciona el año de tu camión';
        container.innerHTML = '<p class="empty-state">⬆️ Selecciona el año de tu camión (o elige "General" si no lo recuerdas) para ver los repuestos disponibles.</p>';
        return;
    }
    
    const anioMostrado = esAnioGeneral ? 'General' : anioNumerico;
    if (titulo) titulo.textContent = `Repuestos disponibles para ${state.marca} ${state.modelo} ${anioMostrado}`;
    
    const repuestos = obtenerRepuestosActuales();
    
    if (!repuestos.length) {
        container.innerHTML = '<p class="empty-state">No hay repuestos de catálogo para esta selección. Contáctanos por WhatsApp y lo conseguimos.</p>';
        return;
    }
    
    // Mostrar skeletons primero
    repuestos.forEach(() => {
        const skeleton = document.createElement('div');
        skeleton.className = 'repuesto-item skeleton';
        skeleton.innerHTML = `
            <div class="repuesto-imagen skeleton"></div>
            <div class="repuesto-info">
                <div class="skeleton-text" style="height: 1.2rem; width: 80%; margin: 0 auto var(--space-sm);"></div>
                <div class="skeleton-btn" style="height: 2.5rem; width: 100%;"></div>
            </div>
        `;
        container.appendChild(skeleton);
    });
    
    // Reemplazar skeletons con contenido real (pequeño delay para animación)
    requestAnimationFrame(() => {
        repuestos.forEach((repuesto, index) => {
            const estaSeleccionado = state.repuestosSeleccionados.includes(repuesto.id);
            const elemento = crearElementoRepuesto(repuesto, estaSeleccionado);
            const skeleton = container.children[index];
            if (skeleton) {
                container.replaceChild(elemento, skeleton);
            }
        });
    });
}

function crearElementoRepuesto(repuesto, seleccionado) {
    const div = document.createElement('div');
    div.className = `repuesto-item ${seleccionado ? 'seleccionado' : ''}`;
    div.dataset.id = repuesto.id;
    
// Sanitizar datos para prevenir XSS
    const imgSrc = SecurityUtils.sanitizeAttribute(repuesto.img);
    const altText = SecurityUtils.sanitizeAttribute(repuesto.nombre);
    const nombreSeguro = SecurityUtils.sanitizeHTML(repuesto.nombre);
    const idSeguro = SecurityUtils.sanitizeAttribute(repuesto.id);
    
    div.innerHTML = `
        <div class="repuesto-imagen" data-nombre="${altText}">
            <img src="${imgSrc}" 
                 alt="${altText}" 
                 loading="lazy"
                 decoding="async"
                 onerror="this.onerror=null; this.parentElement.classList.add('img-error'); this.style.display='none';">
            <span class="check-icon">✓</span>
        </div>
        <div class="repuesto-info">
            <h4>${nombreSeguro}</h4>
            <button class="btn-toggle" onclick="toggleRepuesto('${idSeguro}')">
                ${seleccionado ? '✓ Agregado' : '+ Agregar'}
            </button>
        </div>
    `;
    
    div.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            toggleRepuesto(repuesto.id);
        }
    });
    
return div;
}

function toggleRepuesto(id) {
    registerGlobal('toggleRepuesto', toggleRepuesto);
    // Validación de entrada
    if (!SecurityUtils.validateRepuestoId(id)) {
        ErrorHandler.handleError(new Error(`ID de repuesto inválido: ${id}`), { fn: 'toggleRepuesto' });
        return;
    }
    
    // Rate limiting: máximo 30 clicks por minuto
    const rateLimit = SecurityUtils.checkRateLimit(`toggle_${id}`, 30, 60000);
    if (!rateLimit.allowed) {
        mostrarNotificacion('Demasiados intentos. Espere un momento.', 'error');
        return;
    }
    
    try {
        const index = state.repuestosSeleccionados.indexOf(id);
        const repuesto = obtenerRepuestosActuales().find(r => r.id === id) || DATA.repuestos.find(r => r.id === id);
        
        if (!repuesto) {
            ErrorHandler.handleError(new Error(`Repuesto no encontrado: ${id}`), { fn: 'toggleRepuesto' });
            mostrarNotificacion('Repuesto no disponible', 'error');
            return;
        }
        
        if (index > -1) {
            state.repuestosSeleccionados.splice(index, 1);
            reproducirClick(false);
            mostrarNotificacion(`${SecurityUtils.sanitizeHTML(repuesto.nombre)} eliminado`, 'error');
            trackRepuestoQuitado(id, repuesto.nombre);
        } else {
            state.repuestosSeleccionados.push(id);
            reproducirClick(true);
            mostrarNotificacion(`${SecurityUtils.sanitizeHTML(repuesto.nombre)} agregado`, 'success');
            trackRepuestoAgregado(id, repuesto.nombre);
        }
        
        renderizarRepuestos();
        actualizarResumen();
    } catch (error) {
        ErrorHandler.handleError(error, { fn: 'toggleRepuesto', repuestoId: id });
        mostrarNotificacion('Error al actualizar selección', 'error');
    }
}

// Sonido "check" al seleccionar/quitar repuestos (Web Audio API)
function reproducirClick(agregando = true) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        if (agregando) {
            // Sonido "check" - corto, nítido, como un tick de confirmación
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square'; // Onda cuadrada = sonido más "digital/check"
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.01);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
            osc.onended = () => ctx.close();
        } else {
            // Sonido suave para quitar - "pop" grave
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
            osc.onended = () => ctx.close();
        }
    } catch (e) {
        // Silencioso si el navegador no soporta AudioContext
    }
}

// ============================================
// RESUMEN Y COTIZACIÓN - ORIGINAL PRESERVADO
// ============================================

function obtenerRepuestoPorId(id) {
    const repuestoData = DATA.repuestos.find(r => r.id === id);
    if (repuestoData) return repuestoData;
    
    if (typeof CATALOGO !== 'undefined') {
        for (const marca of Object.values(CATALOGO)) {
            for (const modelo of Object.values(marca)) {
                const encontrado = modelo.find(r => r.id === id);
                if (encontrado) return encontrado;
            }
        }
    }
    
    // Buscar también en repuestos subidos desde el panel
    if (typeof REPUESTOS_EXTRA !== 'undefined' && Array.isArray(REPUESTOS_EXTRA)) {
        const encontrado = REPUESTOS_EXTRA.find(r => r.id === id);
        if (encontrado) return encontrado;
    }
    return null;
}

function actualizarResumen() {
    const lista = document.getElementById('listaResumen');
    const contador = document.getElementById('contadorItems');
    
    if (state.repuestosSeleccionados.length === 0) {
        lista.innerHTML = '<p class="empty-state">Selecciona los repuestos que necesitas arriba...</p>';
        contador.textContent = '0 items';
        return;
    }
    
    lista.innerHTML = '';
    state.repuestosSeleccionados.forEach(id => {
        const repuesto = obtenerRepuestoPorId(id);
        if (!repuesto) return;
        const item = document.createElement('div');
        item.className = 'resumen-item';
        item.innerHTML = `
            <span>${repuesto.nombre}</span>
            <button class="btn-remove" onclick="toggleRepuesto('${id}')" aria-label="Eliminar ${repuesto.nombre}">×</button>
        `;
        lista.appendChild(item);
    });
    
    const cantidad = state.repuestosSeleccionados.length;
    contador.textContent = `${cantidad} item${cantidad !== 1 ? 's' : ''}`;
}

function enviarCotizacion() {
    registerGlobal('enviarCotizacion', enviarCotizacion);
    // Rate limiting: máximo 5 envíos por minuto
    const rateLimit = SecurityUtils.checkRateLimit('enviar_cotizacion', 5, 60000);
    if (!rateLimit.allowed) {
        mostrarNotificacion(`Demasiados envíos. Intente en ${rateLimit.retryAfter}s`, 'error');
        return;
    }
    
    // Validaciones
    if (!state.modelo || !SecurityUtils.validateModelo(state.marca, state.modelo)) {
        mostrarNotificacion('Por favor selecciona un modelo válido', 'error');
        document.getElementById('modeloSelect').focus();
        return;
    }
    
    // El año es obligatorio: debe ser un valor numérico válido o "General".
    const esAnioGeneral = state.anio === 'general';
    const anioNumerico = parseInt(state.anio);
    const anioValido = esAnioGeneral || (!isNaN(anioNumerico) && SecurityUtils.validateYear(state.anio));
    if (!anioValido) {
        mostrarNotificacion('Por favor selecciona el año o "General"', 'error');
        document.getElementById('anioSelect').focus();
        return;
    }
    
    if (state.repuestosSeleccionados.length === 0) {
        mostrarNotificacion('Selecciona al menos un repuesto', 'error');
        return;
    }
    
    // Validar cada ID de repuesto
    const idsInvalidos = state.repuestosSeleccionados.filter(id => !SecurityUtils.validateRepuestoId(id));
    if (idsInvalidos.length > 0) {
        ErrorHandler.handleError(new Error(`IDs inválidos en cotización: ${idsInvalidos.join(', ')}`), { fn: 'enviarCotizacion' });
        mostrarNotificacion('Error en selección. Recargue e intente de nuevo.', 'error');
        return;
    }
    
    // Sanitizar nombres para el mensaje
    const nombresRepuestos = state.repuestosSeleccionados.map(id => {
        const r = obtenerRepuestoPorId(id);
        return r ? SecurityUtils.sanitizeHTML(r.nombre) : SecurityUtils.sanitizeHTML(id);
    });
    
    const marcaSegura = SecurityUtils.sanitizeHTML(state.marca);
    const modeloSeguro = SecurityUtils.sanitizeHTML(state.modelo);
    const anioMostrado = esAnioGeneral ? 'General' : anioNumerico;
    const anioSeguro = SecurityUtils.sanitizeHTML(String(anioMostrado));
    
    const mensaje = `¡Hola! Me interesa cotizar los siguientes repuestos:

🚛 *Marca:* ${marcaSegura}
🔧 *Modelo:* ${modeloSeguro}
📅 *Año:* ${anioSeguro}

📋 *Repuestos solicitados:*
${nombresRepuestos.map(r => '• ' + r).join('\n')}

Por favor envíenme precios y disponibilidad. ¡Gracias!`;
    
    const btn = document.getElementById('btnEnviar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="loading">⏳</span> Enviando...';
    btn.disabled = true;
    
    // Construir URL de WhatsApp con UTM validada
    const utm = new URLSearchParams(utmParams);
    const waUrl = `https://wa.me/573124692806?text=${encodeURIComponent(mensaje)}&${utm.toString()}`;
    
    // Validar URL final
    if (!SecurityUtils.validateWhatsAppURL(waUrl)) {
        ErrorHandler.handleError(new Error('URL de WhatsApp inválida generada'), { fn: 'enviarCotizacion', url: waUrl });
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
        return;
    }
    
    setTimeout(() => {
        try {
            window.open(waUrl, '_blank', 'noopener,noreferrer');
            trackCotizacionEnviada(state.repuestosSeleccionados.length);
            trackWhatsAppClick('cotizador');
        } catch (error) {
            ErrorHandler.handleError(error, { fn: 'enviarCotizacion' });
        } finally {
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }
    }, 600);
}

// ============================================
// NOTIFICACIONES - ORIGINAL PRESERVADO
// ============================================

function mostrarNotificacion(texto, tipo = 'success') {
    const notif = document.getElementById('notificacion');
    const icon = document.getElementById('notifIcon');
    const text = document.getElementById('notifText');
    
    // Sanitizar texto
    const textoSeguro = SecurityUtils.sanitizeHTML(texto);
    
    text.textContent = textoSeguro;
    icon.textContent = tipo === 'success' ? '✓' : '⚠';
    
    // ARIA live region
    notif.setAttribute('role', 'alert');
    notif.setAttribute('aria-live', 'polite');
    notif.setAttribute('aria-atomic', 'true');
    
    notif.className = `notificacion ${tipo} mostrar`;
    
    // Anunciar a lectores de pantalla
    AccessibilityUtils.announce(textoSeguro, 'polite');
    
    setTimeout(() => {
        notif.classList.remove('mostrar');
    }, 3000);
}

// ============================================
// UTILIDADES - ORIGINAL PRESERVADO
// ============================================

document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.opacity = '0.5';
        this.parentElement.classList.add('imagen-error');
    });
});

// Obtener parámetros UTM de la URL
function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_source: params.get('utm_source') || 'direct',
        utm_medium: params.get('utm_medium') || 'none',
        utm_campaign: params.get('utm_campaign') || 'none',
        utm_content: params.get('utm_content') || 'none',
        utm_term: params.get('utm_term') || 'none'
    };
}

const utmParams = getUTMParams();

// TrackEvent mejorado con GA4 + UTM
const trackEvent = (accion, categoria, etiqueta, valor = null) => {
    const eventData = {
        event_category: categoria,
        event_label: etiqueta,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content,
        utm_term: utmParams.utm_term
    };
    
    if (valor !== null) {
        eventData.value = valor;
    }
    
    if (window.gtag) {
        gtag('event', accion, eventData);
    }
    console.log(`[Analytics] ${accion} | ${categoria} | ${etiqueta}`, eventData);
};

// Eventos específicos de negocio
function trackMarcaSeleccionada(marca) {
    registerGlobal('trackMarcaSeleccionada', trackMarcaSeleccionada);
    return trackEvent('select_marca', 'cotizador', marca);
}

function trackModeloSeleccionado(modelo) {
    registerGlobal('trackModeloSeleccionado', trackModeloSeleccionado);
    return trackEvent('select_modelo', 'cotizador', modelo);
}

function trackAnioSeleccionado(anio) {
    registerGlobal('trackAnioSeleccionado', trackAnioSeleccionado);
    return trackEvent('select_anio', 'cotizador', anio);
}

function trackRepuestoAgregado(repuestoId, repuestoNombre) {
    registerGlobal('trackRepuestoAgregado', trackRepuestoAgregado);
    return trackEvent('add_repuesto', 'cotizador', repuestoNombre, 1);
}

function trackRepuestoQuitado(repuestoId, repuestoNombre) {
    registerGlobal('trackRepuestoQuitado', trackRepuestoQuitado);
    return trackEvent('remove_repuesto', 'cotizador', repuestoNombre, 1);
}

function trackCotizacionEnviada(totalItems) {
    registerGlobal('trackCotizacionEnviada', trackCotizacionEnviada);
    return trackEvent('send_cotizacion', 'conversion', 'whatsapp', totalItems);
}

function trackWhatsAppClick(origen) {
    registerGlobal('trackWhatsAppClick', trackWhatsAppClick);
    return trackEvent('click_whatsapp', 'contacto', origen);
}

function trackLlamadaClick() {
    registerGlobal('trackLlamadaClick', trackLlamadaClick);
    return trackEvent('click_llamar', 'contacto', 'header');
}

function trackTikTokClick(videoId) {
    registerGlobal('trackTikTokClick', trackTikTokClick);
    return trackEvent('click_tiktok', 'social', videoId);
}

function trackMapsClick() {
    registerGlobal('trackMapsClick', trackMapsClick);
    return trackEvent('click_maps', 'contacto', 'como-llegar');
}

// Clics en redes sociales (hero, seccion social, footer). La red llega como
// 'instagram', 'youtube', 'tiktok' o 'maps' para distinguirlas en analytics.
function trackSocialClick(red) {
    registerGlobal('trackSocialClick', trackSocialClick);
    return trackEvent('click_social', 'social', String(red || 'desconocida'));
}

function trackEnvioFotoWhatsApp() {
    registerGlobal('trackEnvioFotoWhatsApp', trackEnvioFotoWhatsApp);
    return trackEvent('envio_foto_whatsapp', 'conversion', 'segunda-via');
}

function trackNavegacionMenu(seccion) {
    registerGlobal('trackNavegacionMenu', trackNavegacionMenu);
    return trackEvent('navegacion_menu', 'ux', seccion);
}

// ============================================
// MENÚ DE NAVEGACIÓN (móvil + escritorio)
// ============================================

function initMenuMovil() {
    const btn = document.getElementById('btnMenuMovil');
    const nav = document.getElementById('navPrincipal');
    if (!btn || !nav) return;

    const cerrarMenu = () => {
        nav.classList.remove('nav-abierto');
        btn.classList.remove('menu-abierto');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menú de navegación');
        document.body.classList.remove('menu-abierto-activo');
    };

    const abrirMenu = () => {
        nav.classList.add('nav-abierto');
        btn.classList.add('menu-abierto');
        btn.setAttribute('aria-expanded', 'true');
        btn.setAttribute('aria-label', 'Cerrar menú de navegación');
        document.body.classList.add('menu-abierto-activo');
    };

    btn.addEventListener('click', () => {
        if (nav.classList.contains('nav-abierto')) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    // Cerrar al hacer clic en un enlace
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            cerrarMenu();
        });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('nav-abierto')) {
            cerrarMenu();
            btn.focus();
        }
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener('click', (e) => {
        if (!nav.classList.contains('nav-abierto')) return;
        if (nav.contains(e.target) || btn.contains(e.target)) return;
        cerrarMenu();
    });

    // Cerrar si se vuelve a escritorio
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => { if (e.matches) cerrarMenu(); };
    if (mq.addEventListener) {
        mq.addEventListener('change', onChange);
    } else if (mq.addListener) {
        mq.addListener(onChange);
    }

    // El enlace "Cotizador" abre la pantalla de configuracion.
    // Este comportamiento es EXCLUSIVO de el: el resto del menu lo lleva
    // Navegacion.irA() mediante los atributos data-seccion.
    nav.querySelectorAll('a[data-requiere-configurador]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            trackNavegacionMenu('Cotizador');
            const marcaActual = state.marca;
            cerrarMenu();
            if (marcaActual) {
                mostrarPantalla('configurador');
                const cfg = document.getElementById('configurador');
                if (cfg) cfg.style.display = '';
            } else {
                scrollToMarcas();
                mostrarNotificacion('Elige primero la marca de tu camión', 'info');
            }
        });
    });
}

// ============================================
// AÑO EN EL FOOTER
// ============================================

function initFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
}

// ============================================
// ENLACES DE CONTACTO DESDE js/config.js
// ============================================

// El boton de resena en Google solo se muestra si hay una URL real
// configurada. Nunca se muestra un enlace de busqueda inventado.
function initBotonResenaGoogle() {
    registerGlobal('initBotonResenaGoogle', initBotonResenaGoogle);
    const cont = document.getElementById('contenedorBotonResena');
    const btn = document.getElementById('botonResenaGoogle');
    if (!cont || !btn) return;

    const url = (typeof SOCIAL_LINKS !== 'undefined' && SOCIAL_LINKS.googleReviewUrl) || '';

    // El boton solo existe si hay una URL REAL del Perfil de Empresa.
    // Nunca se deja un href="#" como destino: seria un enlace roto
    // y ademas podria leerse como un enlace a reseñas que no existen.
    if (!url.trim()) {
        btn.removeAttribute('href');
        btn.removeAttribute('target');
        cont.hidden = true;
        cont.setAttribute('aria-hidden', 'true');
        return;
    }

    btn.setAttribute('href', url.trim());
    btn.setAttribute('target', '_blank');
    btn.setAttribute('rel', 'noopener noreferrer');
    cont.hidden = false;
    cont.removeAttribute('aria-hidden');
}

// Renderiza los iconos de redes sociales solo si tienen URL real.
// Evita los href="#" que rompen la navegacion y el SEO.
function initRedesSociales() {
    const cont = document.querySelectorAll('[data-social-links]');
    if (cont.length === 0) return;

    const redes = (typeof SOCIAL_LINKS !== 'undefined' && SOCIAL_LINKS) || {};
    const iconos = { tiktok: '🎵', instagram: '📷', facebook: '📘', youtube: '▶️' };
    const nombres = { tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube' };

    cont.forEach(padre => {
        padre.querySelectorAll('[data-social]').forEach(el => el.remove());
        Object.keys(iconos).forEach(red => {
            const url = (redes[red] || '').trim();
            if (!url) return;
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('data-social', red);
            a.setAttribute('aria-label', nombres[red]);
            a.textContent = iconos[red];
            padre.appendChild(a);
        });
    });
}

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
    if (elements.length === 0) return;
    
    elements.forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// 3D CARD TILT
// ============================================

function initCardTilt() {
    const cards = document.querySelectorAll('.marca-card, .tiktok-card, .testimonio-card, .antes-despues-card');
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => { card.style.transition = ''; }, 500);
        });
    });
}

function initHeroTruckTilt() {
    const hero = document.querySelector('.hero');
    const truck = document.querySelector('.hero-truck-img');
    if (!hero || !truck) return;

    let ticking = false;

    hero.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const rect = hero.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 12;

            truck.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(30px) scale(1.05)`;
            ticking = false;
        });
    });

    hero.addEventListener('mouseleave', () => {
        truck.style.transform = '';
        truck.style.transition = 'transform 0.8s ease-out';
        setTimeout(() => { truck.style.transition = ''; }, 800);
    });
}

// ============================================
// PARTICLES
// ============================================

function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let w, h;

    function resize() {
        const hero = canvas.closest('.hero');
        w = canvas.width = hero ? hero.offsetWidth : window.innerWidth;
        h = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(); }

        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 3 + 1.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < -10) this.x = w + 10;
            if (this.x > w + 10) this.x = -10;
            if (this.y < -10) this.y = h + 10;
            if (this.y > h + 10) this.y = -10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
            ctx.shadowBlur = 15;
            ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    function init() {
        resize();
        particles = [];
        const count = Math.min(Math.floor(w * h / 8000), 80);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { cancelAnimationFrame(animationId); init(); animate(); });
    init();
    animate();
}

// ============================================
// COUNTERS
// ============================================

function initCounters() {
    const counters = document.querySelectorAll('.counter-value');
    if (!counters.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.target) || 0;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);

        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }

    requestAnimationFrame(update);
}

// ============================================
// HERO PARALLAX
// ============================================

function initHeroParallax() {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const hero = document.querySelector('.hero');
                if (hero && scrollY < hero.offsetHeight) {
                    bg.style.transform = `translateY(${scrollY * 0.3}px)`;
                }
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ============================================
// BEFORE/AFTER SLIDER
// ============================================

function initBeforeAfterSliders() {
    document.querySelectorAll('[data-slider]').forEach(setupSlider);
}

function setupSlider(container) {
    const before = container.querySelector('[data-before], .slider-img-before');
    const line = container.querySelector('[data-line]');
    const handle = container.querySelector('[data-handle]');
    let isDragging = false;

    function setPosition(x) {
        const rect = container.getBoundingClientRect();
        let pct = ((x - rect.left) / rect.width) * 100;
        pct = Math.max(2, Math.min(98, pct));

        before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
        line.style.left = pct + '%';
        handle.style.left = pct + '%';
    }

    function onPointerDown(e) {
        isDragging = true;
        container.style.cursor = 'col-resize';
        setPosition(e.clientX || e.touches[0].clientX);
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!isDragging) return;
        setPosition(e.clientX || (e.touches && e.touches[0].clientX));
    }

    function onPointerUp() {
        isDragging = false;
        container.style.cursor = 'col-resize';
    }

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
}

// ============================================
// PARALLAX ANTES Y DESPUÉS
// ============================================

function initAntesDespuesParallax() {
    const sliders = document.querySelectorAll('[data-slider]');
    if (!sliders.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            sliders.forEach(container => {
                const rect = container.getBoundingClientRect();
                const viewport = window.innerHeight;
                if (rect.bottom < 0 || rect.top > viewport) return;

                const center = rect.top + rect.height / 2;
                const offset = (center - viewport / 2) / viewport;
                const img = container.querySelector('.slider-img-after');
                if (img) {
                    img.style.transform = `translateY(${offset * -30}px)`;
                }
            });
            ticking = false;
        });
    });
}

// ============================================
// CURSOR TRAIL - PARTÍCULAS
// ============================================

function initCursorTrail() {
    const canvas = document.getElementById('cursor-trail-canvas');
    if (!canvas || !canvas.getContext || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class TrailParticle {
        constructor(x, y) {
            this.x = x + (Math.random() - 0.5) * 10;
            this.y = y + (Math.random() - 0.5) * 10;
            this.size = Math.random() * 4 + 1;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.life = 1;
            this.decay = 0.02 + Math.random() * 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy -= 0.02;
            this.life -= this.decay;
        }

        draw() {
            if (this.life <= 0) return;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(196, 22, 28, ${this.life * 0.6})`;
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => { p.update(); p.draw(); });
        animationId = requestAnimationFrame(animate);
    }

    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;

    window.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime > 10) {
            particles.push(new TrailParticle(e.clientX, e.clientY));
            if (particles.length > 60) particles.splice(0, particles.length - 60);
            lastTime = now;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!e.touches.length) return;
        const now = Date.now();
        if (now - lastTime > 10) {
            const touch = e.touches[0];
            particles.push(new TrailParticle(touch.clientX, touch.clientY));
            if (particles.length > 60) particles.splice(0, particles.length - 60);
            lastTime = now;
        }
    });

    window.addEventListener('resize', () => { cancelAnimationFrame(animationId); resize(); animate(); });

    resize();
    animate();
}

// ============================================
// HORARIO - ABIERTO / CERRADO DINÁMICO
// ============================================

// Usa BUSINESS_INFO.hours de js/config.js.
// Si no hay ningun horario configurado (todos vacios), no se muestra nada
// porque no debe inventarse informacion que el propietario no ha confirmado.
const DIAS_HORARIO = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function obtenerHorariosConfirmados() {
    const config = (typeof BUSINESS_INFO !== 'undefined' && BUSINESS_INFO.hours) || {};
    return DIAS_HORARIO
        .map(dia => ({ dia, rango: (config[dia] || '').trim() }))
        .filter(d => d.rango !== '');
}

function actualizarEstadoHorario() {
    const el = document.getElementById('estadoHorario');
    if (!el) return;

    const confirmados = obtenerHorariosConfirmados();

    // Sin horarios confirmados: no se inventa nada, no se muestra estado.
    if (confirmados.length === 0) {
        el.textContent = '';
        el.classList.remove('abierto', 'cerrado');
        el.removeAttribute('title');
        return;
    }

    const ahora = new Date();
    const dia = ahora.getDay();
    const hora = ahora.getHours() + ahora.getMinutes() / 60;

    const horarioHoy = confirmados.find(h => h.dia === DIAS_HORARIO[dia]);

    let abierto = false;
    if (horarioHoy) {
        const partes = horarioHoy.rango.split('-').map(p => {
            const [h, m] = p.trim().split(':');
            return parseInt(h, 10) + (parseInt(m || '0', 10) / 60);
        });
        if (partes.length === 2 && partes.every(n => !isNaN(n))) {
            abierto = hora >= partes[0] && hora < partes[1];
        }
    }

    el.textContent = abierto ? '🟢 Abierto ahora' : '🔴 Cerrado ahora';
    el.classList.toggle('abierto', abierto);
    el.classList.toggle('cerrado', !abierto);

    const lista = confirmados
        .map(h => `${NOMBRES_DIA[DIAS_HORARIO.indexOf(h.dia)]}: ${h.rango}`)
        .join('\n');
    el.setAttribute('title', lista);
}

// Exponer funciones globalmente
window.seleccionarMarca = seleccionarMarca;
window.volverAMarcas = volverAMarcas;
window.volverInicio = volverInicio;
window.toggleRepuesto = toggleRepuesto;
