# Carpeta del catalogo en PDF

Coloca aqui el catalogo completo de Lujos y Accesorios.

## Donde va el archivo

    catalogo/catalogo-lujos-y-accesorios.pdf

Esa es la ruta que espera el sitio. No hace falta tocar ningun otro
archivo: la seccion "Catalogo completo" de la pagina principal, el boton
"VER CATALOGO", el boton "DESCARGAR PDF" y el enlace para buscadores ya
apuntan ahi.

## Si cambias el nombre del archivo

Abre `js/config.js` y cambia una sola linea:

    const CATALOG_CONFIG = {
        pdfUrl: 'catalogo/nuevo-nombre.pdf',
        downloadName: 'nuevo-nombre.pdf',
        ...

Eso es todo. El resto se ajusta solo.

## Si el PDF todavia no esta

La seccion no se rompe. Se muestra un aviso:

    Nuestro catalogo esta siendo actualizado. Escribenos por WhatsApp
    y te ayudamos a encontrar el producto que necesitas.

con un boton para escribir por WhatsApp. El sitio sigue funcionando
igual y el catalogo interactivo y el configurador no se ven afectados.

## Notas

- La carpeta `catalogo/` SI se sube al repositorio: no la ignores en
  `.gitignore` ni en las reglas de publicacion de GitHub Pages.
- Si usas un CDN o un dominio propio, tambien puedes poner el PDF alli y
  cambiar `pdfUrl` por la URL completa.
- Tamaño recomendado: menos de 10 MB, para que abra rapido en moviles
  con datos moviles.
