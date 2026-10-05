# Portada del catálogo PDF

Coloca aquí la imagen de portada del catálogo PDF.

## Archivo esperado

    portada-catalogo.jpg

La ruta exacta está configurada en `js/config.js`:

    CATALOG_CONFIG.coverImage = 'img/catalogo/portada-catalogo.jpg'

## Si no existe la imagen

La web **no se rompe**. `js/catalogo-pdf.js` oculta la miniatura rota y
muestra en su lugar un icono de libro 📘. No se inventa ninguna imagen.

## Recomendaciones para la imagen

- Relación de aspecto vertical, la zona de vista previa es vertical.
- Entre 600 x 800 y 1200 x 1600 px.
- JPG optimizado, por debajo de 150 KB.
- Debe ser la **portada real** del PDF, para que lo que se ve coincida con
  lo que se abre.
- Evita texto pequeño: se muestra en móvil.

## Sin metabustos ni scripts

Es un `<img>` normal: usa `loading="lazy"` y `decoding="async"`, y lleva un
`alt` descriptivo en `index.html`.
