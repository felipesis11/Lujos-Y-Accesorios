/* ==========================================================================
   CONFIGURACION CENTRAL DEL SITIO
   ==========================================================================
   Este es el UNICO lugar donde se editan los datos del negocio.
   Cuando cambies el dominio, un telefono o una red social, edita SOLO aqui.

   Dominio: cambia SITE_CONFIG.siteUrl (ver documentacion en SEO-GUIDE.md)
   GA4:     cambia ANALYTICS_CONFIG.measurementId
   ========================================================================== */

'use strict';

/* --------------------------------------------------------------------------
   1. DATOS DEL NEGOCIO  ( BusinessInfo )
   Solo informacion real y confirmada por el propietario del negocio.
   -------------------------------------------------------------------------- */
const BUSINESS_INFO = {
    name: 'Lujos y Accesorios',
    tagline: 'Repuestos y accesorios para camiones',
    description:
        'Repuestos, lujos y accesorios para camiones Chevrolet, JAC, Foton y JMC. ' +
        'Atencion en Bogota y envios a toda Colombia.',

    // --- Contacto ---
    phone: '+573124692806',
    phoneDisplay: '312 469 2806',
    phoneDisplayFull: '+57 312 469 2806',
    whatsapp: '573124692806',

    // --- Ubicacion (datos reales confirmados) ---
    address: {
        street: 'Calle 6A #17-59',
        neighborhood: 'La Estanzuela',
        locality: 'Bogota',
        region: 'Bogota D.C.',
        country: 'Colombia',
        countryCode: 'CO',
        // Sin coordenadas: la ubicacion se resuelve por busqueda de direccion
        // en Google Maps para no inventar datos.
        postalCode: ''
    },

    // --- Correo ---
    // PENDIENTE DE CONFIRMAR con el propietario. Si no existe, dejar vacio
    // y se ocultara automaticamente del sitio.
    email: '',

    // --- Horario ---
    // PENDIENTE DE CONFIRMAR con el propietario.
    // Todos los campos estan vacios a proposito: NO se publica ningun
    // horario ni "Abierto ahora" hasta que se confirme. Deja '' los dias
    // que el negocio no atienda y coloca el horario solo en los confirmados.
    // Ejemplo confirmado: monday: '08:00 - 18:00'
    hours: {
        monday: '',
        tuesday: '',
        wednesday: '',
        thursday: '',
        friday: '',
        saturday: '',
        sunday: ''
    },

    // --- Antiguedad ---
    // PENDIENTE DE CONFIRMAR. Mientras sea 0 no se publica "X anos".
    // Coloca aqui el numero real de anos en operacion.
    yearsInBusiness: 0
};

/* --------------------------------------------------------------------------
   2. CONFIGURACION DEL SITIO  ( SiteConfig )
   -------------------------------------------------------------------------- */
const SITE_CONFIG = {
    /**
     * DOMINIO DEFINITIVO - CAMBIAR AQUI
     * ------------------------------------------------------------------
     * El dominio aun NO esta configurado. Reemplaza este valor cuando
     * conectes tu dominio propio, o cuando publiques en GitHub Pages con
     * el formato: https://TU_USUARIO.github.io/TU_REPOSITORIO
     *
     * IMPORTANTE: si cambias el dominio, tambien debes regenerar las paginas
     * internas y el sitemap ejecutando:  ./generar-paginas.ps1
     */
    siteUrl: 'https://felipesis11.github.io/Lujos-Y-Accesorios',

    lang: 'es',
    locale: 'es_CO',
    themeColor: '#c4161c',
    themeColorDark: '#0b1f3a',
    backgroundColor: '#ffffff',
    twitter: '', // PENDIENTE: cuenta de X/Twitter
    author: 'Lujos y Accesorios'
};

/* --------------------------------------------------------------------------
   3. REDES SOCIALES  ( SocialLinks )
   -------------------------------------------------------------------------- */
const SOCIAL_LINKS = {
    // TikTok principal real de la empresa
    tiktok: 'https://www.tiktok.com/@lujosyaccesorioscamiones',

    // Instagram oficial de la empresa
    instagram: 'https://www.instagram.com/lujosyaccesorioscamiones',

    // PENDIENTE: reemplazar con la URL real.
    // Mientras este vacio ('') el icono NO se renderiza (nada de href="#").
    facebook: '',

    // Canal oficial de YouTube de la empresa
    youtube: 'https://www.youtube.com/@lujosyaccesorios-z1p',

    // Enlace oficial corto al perfil en Google Maps (Como llegar).
    googleMaps: 'https://maps.app.goo.gl/6jB4HeUk5NPbDvGt6',

    /**
     * URL para "Dejarnos una resena en Google".
     * PENDIENTE: pega aqui el enlace de tu Perfil de Empresa en Google.
     * Como obtenerlo:
     *   1. Abre tu perfil en Google Maps
     *   2. Copia la URL del navegador (empieza por https://g.page/ o maps)
     * Mientras este vacio, el boton de resena se oculta y NO se muestra
     * ningun enlace falso ni una busqueda de Google que no sea tu perfil.
     */
    googleReviewUrl: ''
};

/* --------------------------------------------------------------------------
   3b. CATALOGO EN PDF  ( CatalogConfig )
   --------------------------------------------------------------------------
   UNICO LUGAR donde se cambia el PDF. No hace falta tocar ningun otro
   archivo para sustituir el catalogo.

   COMO USARLO
   1. Sube tu PDF en la carpeta  /catalogo/  del proyecto
      con el nombre indicado en  pdfUrl.
   2. Listo. La seccion "Catalogo completo" de la home ya lo enlaza.

   Si mas adelante cambias el nombre del archivo, cambia SOLO  pdfUrl
   aqui y ya. El resto del sitio (boton Ver, boton Descargar, enlace SEO,
   service worker y sitemap) se actualiza solo.

   RUTAS
   - Son relativas a la carpeta raiz del sitio, nunca absolutas.
   - No se usa ningun C:\ ni ruta del servidor, asi que el mismo sitio
     funciona en local (file://), en GitHub Pages y en un dominio propio.

   pdfUrl        Ruta al PDF (relativa). El navegador la resuelve igual
                 en local, en GitHub Pages y en produccion.
   downloadName  Nombre con el que se GUARDA en el equipo del visitante.
   coverImage    Miniatura de portada. Si el archivo no existe, la seccion
                 lo detecta y muestra un aviso, sin inventar una portada.
   preview       Miniatura de la portada dentro de la tarjeta.
   whatsappText  Mensaje prellenado de la cotizacion por WhatsApp.
-------------------------------------------------------------------------- */
const CATALOG_CONFIG = {
    pdfUrl: 'catalogo/catalogo-lujos-y-accesorios.pdf',
    downloadName: 'catalogo-lujos-y-accesorios.pdf',
    coverImage: 'img/catalogo/portada-catalogo.jpg',

    // Texto alternativo del enlace real al PDF (accesibilidad y SEO).
    linkText: 'Catálogo PDF de repuestos, lujos y accesorios para camiones',

    // Texto corto que describe el archivo, mostrado bajo los botones.
    caption: 'PDF del catálogo de Lujos y Accesorios',

    // Mensaje que se abre en WhatsApp al cotizar desde esta seccion.
    whatsappText:
        'Hola, estoy viendo el catálogo de Lujos y Accesorios y quiero cotizar un producto.'
};

/* --------------------------------------------------------------------------
   4. ANALYTICS  ( AnalyticsConfig )
   -------------------------------------------------------------------------- */
const ANALYTICS_CONFIG = {
    /**
     * REEMPLAZAR CON ID REAL DE GA4
     * Obtén tu ID en: https://analytics.google.com -> Administracion -> Flujos de datos
     * Formato: G-XXXXXXXXXX
     * Mientras sea 'G-XXXXXXXXXX' el script NO se carga (no genera ruido).
     */
    measurementId: 'G-XXXXXXXXXX',

    // Eventos que se envian a GA4
    events: {
        pageView: 'page_view',
        clickWhatsapp: 'click_whatsapp',
        clickLlamada: 'click_llamada',
        clickTikTok: 'click_tiktok',
        clickMaps: 'click_maps',
        marcaSeleccionada: 'marca_seleccionada',
        modeloSeleccionado: 'modelo_seleccionado',
        productoSeleccionado: 'producto_seleccionado',
        cotizacionIniciada: 'cotizacion_iniciada',
        cotizacionEnviada: 'cotizacion_enviada',
        envioFotoWhatsapp: 'envio_foto_whatsapp'
    }
};

/* --------------------------------------------------------------------------
   5. SEO - configuracion de textos por defecto
   -------------------------------------------------------------------------- */
const SEO_CONFIG = {
    titleHome: 'Repuestos y Accesorios para Camiones en Bogota | Lujos y Accesorios',
    titleTemplate: '%s | Lujos y Accesorios',
    defaultDescription:
        'Repuestos, lujos y accesorios para camiones Chevrolet, JAC, Foton y JMC en Bogota. ' +
        'Cotiza por WhatsApp o envia una foto de la pieza que necesitas.',
    // Imagen social principal. Debe existir en /img/. 1200x630 px recomendado.
    ogImage: 'img/og-image.jpg',
    ogImageAlt: 'Lujos y Accesorios - Repuestos y accesorios para camiones en Bogota'
};

/* --------------------------------------------------------------------------
   6. MARCAS Y MODELOS  ( deben coincidir con js/catalogo.js )
   -------------------------------------------------------------------------- */
const BRANDS = [
    {
        key: 'chevrolet',
        name: 'Chevrolet',
        slug: 'chevrolet',
        description:
            'Repuestos y accesorios para camiones Chevrolet en Bogota. Bomperes, farolas, ' +
            'estribos, espejos, persianas, guardabarros y mas para NHR, NPR, NQR, NKR, FRR y FTR.',
        models: [
            { name: 'NHR', slug: 'nhr' },
            { name: 'NPR', slug: 'npr' },
            { name: 'NQR', slug: 'nqr' },
            { name: 'NKR', slug: 'nkr' },
            { name: 'FRR', slug: 'frr' },
            { name: 'FTR', slug: 'ftr' }
        ]
    },
    {
        key: 'jac',
        name: 'JAC',
        slug: 'jac',
        description:
            'Repuestos y accesorios para camiones JAC en Bogota. Piezas para las series 1035, ' +
            '1040, 1042, 1048, 1061, 1083, POWER y POWER EURO 6.',
        models: [
            { name: 'JAC 1035,1040,1042,1048,1061,1083', slug: '1035-1040-1042-1048-1061-1083' },
            { name: 'POWER', slug: 'power' },
            { name: 'POWER EURO 6', slug: 'power-euro-6' }
        ]
    },
    {
        key: 'foton',
        name: 'Foton',
        slug: 'foton',
        description:
            'Repuestos y accesorios para camiones Foton en Bogota. Bomperes, farolas, ' +
            'estribos y mas para FHR, FQR, FRR, FKR y Ollin.',
        models: [
            { name: 'FHR', slug: 'fhr' },
            { name: 'FQR', slug: 'fqr' },
            { name: 'FRR', slug: 'frr' },
            { name: 'FKR', slug: 'fkr' },
            { name: 'Ollin', slug: 'ollin' }
        ]
    },
    {
        key: 'jmc',
        name: 'JMC',
        slug: 'jmc',
        description:
            'Repuestos y accesorios para camiones JMC en Bogota. Piezas para CHR, CQR, CKR ' +
            'y sus versiones Euro 6.',
        models: [
            { name: 'CHR', slug: 'chr' },
            { name: 'CQR', slug: 'cqr' },
            { name: 'CKR', slug: 'ckr' },
            { name: 'CHR Euro 6', slug: 'chr-euro-6' },
            { name: 'CQR Euro 6', slug: 'cqr-euro-6' },
            { name: 'CKR Euro 6', slug: 'ckr-euro-6' }
        ]
    }
];

/* --------------------------------------------------------------------------
   7. CATEGORIAS SEO  ( se generan paginas desde /productos/<slug>/ )
   Solo categorias que existen REALMENTE en el catalogo (img/repuestos).
   -------------------------------------------------------------------------- */
const CATEGORIES = [
    {
        slug: 'bomper',
        name: 'Bumperes',
        singular: 'Bumper',
        title: 'Bumperes para Camiones',
        description: 'Bumperes para camiones Chevrolet, JAC, Foton y JMC en Bogota. Piezas originales y bajo pedido.'
    },
    {
        slug: 'farolas',
        name: 'Farolas',
        singular: 'Farola',
        title: 'Farolas para Camiones',
        description: 'Farolas y conjuntos de farolas para camiones Chevrolet, JAC, Foton y JMC. Bogota y envios nacionales.'
    },
    {
        slug: 'estribos',
        name: 'Estribos',
        singular: 'Estribo',
        title: 'Estribos para Camiones',
        description: 'Estribos y plataformas de acceso para camiones livianos y pesados. Chevrolet, JAC, Foton y JMC.'
    },
    {
        slug: 'persianas',
        name: 'Persianas',
        singular: 'Persiana',
        title: 'Persianas para Camiones',
        description: 'Persianas cromadas y estandar para camiones Chevrolet, JAC, Foton y JMC en Bogota.'
    },
    {
        slug: 'espejos',
        name: 'Espejos y Brazos',
        singular: 'Espejo',
        title: 'Espejos y Brazos para Camiones',
        description: 'Espejos, brazos y conjuntos de espejos para camiones Chevrolet, JAC, Foton y JMC.'
    },
    {
        slug: 'exploradoras',
        name: 'Exploradoras',
        singular: 'Exploradora',
        title: 'Exploradoras para Camiones',
        description: 'Exploradoras y barras de exploracion para camiones. Bogota y envios a toda Colombia.'
    },
    {
        slug: 'guardabarros',
        name: 'Guardabarros',
        singular: 'Guardabarro',
        title: 'Guardabarros para Camiones',
        description: 'Guardabarros para camiones livianos y pesados de Chevrolet, JAC, Foton y JMC.'
    },
    {
        slug: 'cromos',
        name: 'Cromos y Embellecimiento',
        singular: 'Cromo',
        title: 'Cromos y Accesorios para Camiones',
        description: 'Cromos decorativos y detalles cromados para camiones. Bogota y envios nacionales.'
    },
    {
        slug: 'manijas',
        name: 'Manijas',
        singular: 'Manija',
        title: 'Manijas para Camiones',
        description: 'Manijas, chapas y herrajes de puerta para camiones Chevrolet, JAC, Foton y JMC.'
    },
    {
        slug: 'direccionales',
        name: 'Direccionales',
        singular: 'Direccional',
        title: 'Direccionales para Camiones',
        description: 'Direccionales, cocuyos y sets de direccionales para camiones livianos y pesados.'
    }
];

/* --------------------------------------------------------------------------
   8. Categorias principales (paginas de primer nivel)
   -------------------------------------------------------------------------- */
const CATEGORY_PAGES = [
    {
        slug: 'repuestos-para-camiones',
        title: 'Repuestos para Camiones en Bogota',
        h1: 'Repuestos para camiones',
        description:
            'Catalogo de repuestos para camiones Chevrolet, JAC, Foton y JMC. ' +
            'Bumperes, farolas, estribos, persianas, espejos y mas. Bogota y envios a toda Colombia.'
    },
    {
        slug: 'accesorios-para-camiones',
        title: 'Accesorios para Camiones en Bogota',
        h1: 'Accesorios para camiones',
        description:
            'Accesorios para camiones: exploradoras, cromos, manijas, guardabarros ' +
            'y mas para Chevrolet, JAC, Foton y JMC. Bogota y envios nacionales.'
    },
    {
        slug: 'lujos-para-camiones',
        title: 'Lujos para Camiones en Bogota',
        h1: 'Lujos para camiones',
        description:
            'Lujos, embellecimiento y detalles premium para camiones Chevrolet, JAC, Foton y JMC. ' +
            'Persianas cromadas, direccionales LED y accesorios originales.'
    }
];

/* --------------------------------------------------------------------------
   EXPORTACION GLOBAL
   -------------------------------------------------------------------------- */
  window.SITE = {
      BUSINESS_INFO: BUSINESS_INFO,
      SITE_CONFIG: SITE_CONFIG,
      SOCIAL_LINKS: SOCIAL_LINKS,
      ANALYTICS_CONFIG: ANALYTICS_CONFIG,
      SEO_CONFIG: SEO_CONFIG,
      BRANDS: BRANDS,
      CATEGORIES: CATEGORIES,
      CATEGORY_PAGES: CATEGORY_PAGES,
      CATALOG_CONFIG: CATALOG_CONFIG
  };
  
  // Tambien disponible sin prefijo para codigo existente
  window.BUSINESS_INFO = BUSINESS_INFO;
  window.SOCIAL_LINKS = SOCIAL_LINKS;
  window.SITE_CONFIG = SITE_CONFIG;

  // Catalogo PDF: tambien sin prefijo, que es como lo usa app.js
  window.CATALOG_CONFIG = CATALOG_CONFIG;
