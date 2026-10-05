# Google Search Console — Lujos y Accesorios

Guía para el propietario. Nada de esto se puede hacer solo con código:
requiere entrar a https://search.google.com/search-console con una
cuenta de Google.

## 1. Qué propiedad verificar

Verificar la propiedad de **prefijo de URL** (no la de dominio, porque
aún no hay dominio propio):

```
https://felipesis11.github.io/Lujos-Y-Accesorios/
```

Tal cual, con `https://`, con el nombre de usuario y repositorio
exactos (`Lujos-Y-Accesorios` con esas mayúsculas) y con `/` al final.

## 2. Cómo verificarla (elegir UN método)

Search Console ofrece varios métodos. Para este sitio sirven:

**A. Etiqueta HTML (recomendado).**
1. Search Console muestra un `<meta name="google-site-verification" ...>`.
2. Pégalo en `index.html`, dentro del `<head>`, junto a las demás
   etiquetas `meta`.
3. Sube el cambio a GitHub y pulsa "Verificar".

**B. Google Analytics.**
Si algún día se configura GA4 en la página (hoy no está configurado),
la misma cuenta puede verificar automáticamente.

**C. Archivo HTML.**
Search Console pide subir un archivo `googleXXXX.html` a la raíz.
En este proyecto eso significa agregarlo a la carpeta del proyecto
y subirlo a GitHub. Funciona, pero la opción A es más simple.

NO usar el método "Proveedor de nombres de dominio" (DNS): no hay
dominio propio todavía.

## 3. Qué sitemap enviar

Una vez verificada la propiedad:

Sitemaps → Añadir un sitemap nuevo → escribir:

```
sitemap.xml
```

El archivo ya existe en la raíz y lista las 40 URLs reales
(principal + 39 páginas de marcas, modelos, categorías y legales).
Search Console lo leerá solo.

## 4. Primera URL para inspeccionar

Inspección de URLs → pegar:

```
https://felipesis11.github.io/Lujos-Y-Accesorios/
```

Pedir la **indexación** de la principal primero. Las 39 internas se
descubren solas por el sitemap y los enlaces internos (menú, footer,
categorías, migas de pan).

## 5. Qué revisar cada mes

- **Cobertura**: que las 40 páginas estén "indexadas", sin errores 404.
- **Rendimiento**: con qué palabras aparece el sitio
  (ej: "farolas para camiones", "repuestos camiones Bogotá").
- **Experiencia en móviles**: sin errores de usabilidad.
- Si alguna página sale como "descubierta pero no indexada",
  pedir indexación manual desde Inspección de URLs.

## 6. Cuando llegue el dominio propio

1. Cambiar `siteUrl` en `js/config.js` al dominio nuevo.
2. Regenerar: `powershell -ExecutionPolicy Bypass -File .\generar-paginas.ps1`
3. Subir a GitHub. El sitemap, los canonical y el JSON-LD se
   actualizan solos con el dominio nuevo.
4. En Search Console, agregar la propiedad nueva (dominio o prefijo)
   y volver a enviar `sitemap.xml`.
