#Requires -Version 5.1
<#
    generar-paginas.ps1
    ==================================================================
    Genera las paginas internas estaticas de Lujos y Accesorios a partir
    del catalogo REAL (js/catalogo.js) y de una plantilla HTML.

    REGLAS DEL PROYECTO:
      * No se inventan productos, marcas, modelos ni precios.
      * Toda imagen publicada se verifica que exista en disco.
      * Una categoria sin productos reales NO genera pagina.
      * Los datos de contacto se leen de js/config.js.

    USO:
      powershell -ExecutionPolicy Bypass -File .\generar-paginas.ps1
      powershell -ExecutionPolicy Bypass -File .\generar-paginas.ps1 -Dominio "https://tudominio.com"
      powershell -ExecutionPolicy Bypass -File .\generar-paginas.ps1 -SoloSimular
#>

[CmdletBinding()]
param(
    [string]$Dominio = '',
    [switch]$SoloSimular
)

$ErrorActionPreference = 'Stop'
$Utf8 = New-Object System.Text.UTF8Encoding($false)
$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path

function Step   { param($t) Write-Host "  $t" -ForegroundColor Cyan }
function Ok     { param($t) Write-Host "  OK  $t" -ForegroundColor Green }
function Aviso   { param($t) Write-Host "  --  $t" -ForegroundColor Yellow }
function Titulo { param($t) Write-Host "`n$t" -ForegroundColor White }

# ============================================
# 1. CONFIGURACION
# ============================================
Titulo '1. Leyendo configuracion...'

$rutaConfig = Join-Path $Raiz 'js\config.js'
if (-not (Test-Path $rutaConfig)) { throw 'No se encontro js\config.js' }
$cfg = [System.IO.File]::ReadAllText($rutaConfig, [System.Text.Encoding]::UTF8)

if ($Dominio) {
    $Sitio = $Dominio.TrimEnd('/')
    Ok "Dominio por parametro: $Sitio"
} else {
    $m = [regex]::Match($cfg, "siteUrl:\s*'([^']+)'")
    $Sitio = ''
    if ($m.Success) { $Sitio = $m.Groups[1].Value.TrimEnd('/') }
    if ($Sitio) { Ok "Dominio de js/config.js: $Sitio" }
    else { Aviso 'siteUrl vacio. Usa -Dominio antes de publicar.' }
}

function DeConfig {
    param([string]$Clave)
    $mm = [regex]::Match($cfg, [regex]::Escape($Clave) + ":\s*'([^']*)'")
    if ($mm.Success) { return $mm.Groups[1].Value }
    return ''
}

$Telefono = DeConfig 'phone'
$Whatsapp = DeConfig 'whatsapp'
$Calle    = DeConfig 'street'
$Barrio   = DeConfig 'neighborhood'
$Ciudad   = DeConfig 'locality'
$Pais     = DeConfig 'country'

$DireccionLista = ((@($Calle, $Barrio) | Where-Object { $_ }) -join ', ')
$DireccionFull  = ((@($Calle, $Barrio, $Ciudad) | Where-Object { $_ }) -join ', ')

# ============================================
# 2. CATALOGO
# ============================================
Titulo '2. Leyendo catalogo real...'

$rutaCat = Join-Path $Raiz 'js\catalogo.js'
if (-not (Test-Path $rutaCat)) { throw 'No se encontro js\catalogo.js' }
$catTexto = [System.IO.File]::ReadAllText($rutaCat, [System.Text.Encoding]::UTF8)

$ini = $catTexto.IndexOf('{', $catTexto.IndexOf('const CATALOGO'))
if ($ini -lt 0) { throw 'No se localizo el objeto CATALOGO' }
$json = $catTexto.Substring($ini).Trim().TrimEnd(';')
$Catalogo = $json | ConvertFrom-Json

$marcas = @()
foreach ($prop in $Catalogo.PSObject.Properties) {
    $modelos = @()
    foreach ($mp in $prop.Value.PSObject.Properties) {
        $productos = @()
        foreach ($p in $mp.Value) {
            $productos += [pscustomobject]@{
                Id     = $p.id
                Nombre = $p.nombre
                Imagen = $p.img
                Existe = (Test-Path -LiteralPath (Join-Path $Raiz ($p.img -replace '/', '\')))
            }
        }
        if ($productos.Count -gt 0) {
            $modelos += [pscustomobject]@{ Modelo = $mp.Name; Productos = $productos }
        }
    }
    if ($modelos.Count -gt 0) {
        $marcas += [pscustomobject]@{ Marca = $prop.Name; Modelos = $modelos }
    }
}

$TotalMarcas    = $marcas.Count
$TotalModelos   = ($marcas | ForEach-Object { $_.Modelos.Count } | Measure-Object -Sum).Sum
$TodosProductos = @($marcas | ForEach-Object { $_.Modelos | ForEach-Object { $_.Productos } })
$TotalProductos = $TodosProductos.Count
Ok "$TotalMarcas marcas, $TotalModelos modelos, $TotalProductos productos"

$faltantes = $TodosProductos | Where-Object { -not $_.Existe }
if ($faltantes) {
    Aviso "$($faltantes.Count) producto(s) con imagen no encontrada (se omiten de las paginas)"
    $faltantes | Select-Object -First 5 | ForEach-Object { Aviso ('    ' + $_.Imagen) }
}

# ============================================
# 3. UTILIDADES
# ============================================
function Slug {
    param([string]$t)
    if (-not $t) { return '' }
    $s = $t.ToLower()
    $s = $s -replace '[áàäâ]', 'a'
    $s = $s -replace '[éèëê]', 'e'
    $s = $s -replace '[íìïî]', 'i'
    $s = $s -replace '[óòöô]', 'o'
    $s = $s -replace '[úùüû]', 'u'
    $s = $s -replace 'ñ', 'n'
    $s = $s -replace 'ç', 'c'
    $s = $s -replace '[^a-z0-9]+', '-'
    return (($s -replace '^-+', '') -replace '-+$', '')
}

function Esc {
    param([string]$t)
    if ($null -eq $t) { return '' }
    $s = $t.Replace('&', '&amp;')
    $s = $s.Replace('<', '&lt;')
    $s = $s.Replace('>', '&gt;')
    $s = $s.Replace('"', '&quot;')
    return $s
}

# Los nombres de modelo del catalogo ya traen el prefijo de marca en
# algunos casos ("JAC 1035,..."). Se evita "JAC JAC ..." en los titulos.
function LimpiarModelo {
    param([string]$modelo, [string]$marca)
    $nombreM = NombreMarca $marca
    $m = $modelo
    if ($m -match '^(?i)' + [regex]::Escape($nombreM) + '\s+(.+)$') { $m = $Matches[1] }
    return $m.Trim()
}

# El slug de un modelo tampoco debe repetir la marca cuando el nombre ya
# la incluye: "JAC 1035,..." produce "jac-1035-..." y no "jac-jac-1035-...".
function SlugModelo {
    param([string]$modelo, [string]$marca)
    return (Slug (LimpiarModelo -modelo $modelo -marca $marca))
}

$paginasCreadas = New-Object System.Collections.Generic.List[string]

function Subir {
    param([string]$ruta, [string]$contenido)
    $dir = Split-Path -Parent $ruta
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    [System.IO.File]::WriteAllText($ruta, $contenido, $Utf8)
    $rel = $ruta.Substring($Raiz.Length).TrimStart('\', '/')
    $paginasCreadas.Add($rel.Replace('\', '/')) | Out-Null
}

# Plantilla base
$rutaPlantilla = Join-Path $Raiz '_plantilla-pagina.html'
if (-not (Test-Path $rutaPlantilla)) { throw 'No se encontro _plantilla-pagina.html' }
$Plantilla = [System.IO.File]::ReadAllText($rutaPlantilla, [System.Text.Encoding]::UTF8)

# Categorias SEO: solo se publican si existen productos que coincidan.
$Categorias = @(
    [pscustomobject]@{ s = 'bumpers';       n = 'Bumperes';                 p = 'bump|bomper' }
    [pscustomobject]@{ s = 'farolas';       n = 'Farolas';                  p = 'farola' }
    [pscustomobject]@{ s = 'estribos';      n = 'Estribos';                 p = 'estribo|plataforma' }
    [pscustomobject]@{ s = 'persianas';     n = 'Persianas';                p = 'persiana' }
    [pscustomobject]@{ s = 'espejos';       n = 'Espejos y brazos';         p = 'espejo|brazo' }
    [pscustomobject]@{ s = 'exploradoras';  n = 'Exploradoras';             p = 'exploradora|exploracion' }
    [pscustomobject]@{ s = 'guardabarros';  n = 'Guardabarros';             p = 'guardabarro|salpicader' }
    [pscustomobject]@{ s = 'cromos';        n = 'Cromos y embellecimiento'; p = 'cromo|ciroma' }
    [pscustomobject]@{ s = 'manijas';       n = 'Manijas';                  p = 'manija' }
    [pscustomobject]@{ s = 'direccionales'; n = 'Direccionales';            p = 'direccional|cucuyo' }
)

$Nivel1 = @(
    [pscustomobject]@{
        s = 'repuestos-para-camiones'
        h = 'Repuestos para camiones'
        d = 'Catalogo de repuestos para camiones Chevrolet, JAC, Foton y JMC en Bogota. Bumperes, farolas, estribos, persianas, espejos y mas.'
    }
    [pscustomobject]@{
        s = 'accesorios-para-camiones'
        h = 'Accesorios para camiones'
        d = 'Accesorios para camiones: exploradoras, cromos, manijas, guardabarros y mas para Chevrolet, JAC, Foton y JMC en Bogota.'
    }
    [pscustomobject]@{
        s = 'lujos-para-camiones'
        h = 'Lujos para camiones'
        d = 'Lujos y embellecimiento para camiones: persianas cromadas, direccionales y detalles premium para Chevrolet, JAC, Foton y JMC.'
    }
)

# El catalogo guarda los nombres como "Jac" y "Jmc". Se normaliza la
# grafia comercial real de las marcas (confirmada por el propietario).
$nombreMarcaReal = @{
    'jac' = 'JAC'
    'jmc' = 'JMC'
}

function NombreMarca {
    param([string]$bruto)
    $s = Slug $bruto
    if ($nombreMarcaReal.ContainsKey($s)) { return $nombreMarcaReal[$s] }
    return $bruto
}

$urls = New-Object System.Collections.Generic.List[string]
$CategoriasUsadas = New-Object System.Collections.Generic.List[string]

function Relativo {
    param([int]$Nivel)
    $s = ''
    for ($i = 0; $i -lt $Nivel; $i++) { $s = $s + '../' }
    return $s
}

# Ruta interna RELATIVA y explicita (con index.html).
#
# Por que no se usa "carpeta/": al abrir el proyecto con file:// el navegador
# no resuelve directorios y muestra el indice de directorio del sistema.
# Con "carpeta/index.html" el enlace funciona igual en local, en GitHub Pages
# y en un dominio propio.
#
# El canonical, el sitemap y el JSON-LD siguen usando URLs limpias con
# barra final: ahi no hay problema porque solo los consume un buscador.
function RutaInterna {
    param([string]$ruta, [int]$Nivel)
    $limpia = $ruta.Trim('/')
    if ($limpia -eq '') { return (Relativo $Nivel) + 'index.html' }
    return (Relativo $Nivel) + $limpia + '/index.html'
}

function NavMarcas {
    param([int]$Nivel = 1)
    $out = @()
    foreach ($m in $marcas) {
        $s = Slug $m.Marca
        $out += ('<li><a class="nav-link" href="' + (RutaInterna $s $Nivel) + '">' + (Esc (NombreMarca $m.Marca)) + '</a></li>')
    }
    return ($out -join '')
}

function CardProducto {
    param($p, [string]$prefijo, [string]$contexto)
    $alt = Esc $p.Nombre
    $src = Esc ($prefijo + $p.Imagen)
    $ctx = ''
    if ($contexto) { $ctx = '<p class="producto-contexto">' + (Esc $contexto) + '</p>' }
    $html  = "`n          <article class=`"producto-card`">`n"
    $html += '            <div class="producto-img"><img src="' + $src + '" alt="' + $alt + '" loading="lazy" decoding="async" width="300" height="300"></div>' + "`n"
    $html += '            <h3 class="producto-nombre">' + $alt + '</h3>' + $ctx + "`n"
    # CTA al cotizador preseleccionado: el home lee #cotizar-<id> y abre
    # marca/modelo/año con el producto ya agregado. El id sale del catalogo
    # real, nunca se escribe a mano.
    if ($p.Id) {
        $html += '            <a class="producto-cotizar" href="' + $prefijo + 'index.html#cotizar-' + $p.Id + '">Cotizar este repuesto</a>' + "`n"
    }
    $html += "          </article>`n"
    return $html
}

function GridProductos {
    param($Items, [int]$Limite, [int]$Nivel, [switch]$ConContexto)
    if (-not $Items) {
        return '      <p class="pagina-nota">Esta seccion aun no tiene productos publicados.</p>'
    }
    $prefijo = Relativo $Nivel
    $sel = @($Items | Where-Object { $_.Existe } | Select-Object -First $Limite)
    $html = '      <div class="productos-grid">'
    foreach ($p in $sel) {
        $ctx = ''
        if ($ConContexto -and $p.PSObject.Properties['Contexto'] -and $p.Contexto) { $ctx = $p.Contexto }
        $html += (CardProducto -p $p -prefijo $prefijo -contexto $ctx)
    }
    $html += "`n      </div>"
    return $html
}

function Bloque {
    param([string]$titulo, [string]$contenido, [string]$nota)
    $html  = "`n      <section class=`"pagina-bloque`">`n"
    $html += '        <h2>' + $titulo + '</h2>' + "`n"
    $html += $contenido
    if ($nota) { $html += "`n        <p class=`"pagina-nota`">" + $nota + '</p>' }
    $html += "`n      </section>`n"
    return $html
}

function ConstruirPagina {
    param(
        [string]$Titulo,
        [string]$Descripcion,
        [string]$H1,
        [string]$Intro,
        [string]$Migas,
        [string]$Extra,
        [int]$Nivel,
        [string]$Url,
        [string]$JsonLd
    )

    $waMsg = [uri]::EscapeDataString('Hola, quiero cotizar ' + $H1 + '. Me pueden ayudar?')
    $waGen = 'https://wa.me/' + $Whatsapp + '?text=Hola%2C%20quiero%20cotizar%20repuestos%20para%20camiones.'
    $migasHtml = ''
    foreach ($m in $Migas) { $migasHtml += '<li>' + $m + '</li>' }

    $h = $Plantilla
    $h = $h.Replace('{{TITULO}}', (Esc $Titulo))
    $h = $h.Replace('{{DESCRIPCION}}', (Esc $Descripcion))
    $h = $h.Replace('{{H1}}', (Esc $H1))
    $h = $h.Replace('{{INTRO}}', (Esc $Intro))
    $h = $h.Replace('{{MIGAS}}', $migasHtml)
    $h = $h.Replace('{{EXTRA}}', $Extra)
    $h = $h.Replace('{{JSONLD}}', $JsonLd)
    $h = $h.Replace('{{URL}}', (Esc $Url))
    $h = $h.Replace('{{SITIO}}', $Sitio)
    $h = $h.Replace('{{REL}}', (Relativo $Nivel))
    $h = $h.Replace('{{NAV_MARCAS}}', (NavMarcas $Nivel))
    $h = $h.Replace('{{LEGAL_PRIVACIDAD}}', (RutaInterna 'politica-privacidad' $Nivel))
    $h = $h.Replace('{{LEGAL_COOKIES}}', (RutaInterna 'politica-cookies' $Nivel))
    $h = $h.Replace('{{WA_GENERAL}}', $waGen)
    $h = $h.Replace('{{WA_CTX}}', ('https://wa.me/' + $Whatsapp + '?text=' + $waMsg))
    $h = $h.Replace('{{MAPS}}', [uri]::EscapeDataString($DireccionFull + ', ' + $Pais))
    $h = $h.Replace('{{DIRECCION}}', (Esc $DireccionFull))
    $h = $h.Replace('{{PAIS}}', (Esc $Pais))
    $h = $h.Replace('{{TELEFONO}}', (Esc $Telefono))
    $h = $h.Replace('{{CTX}}', (Esc $H1))
    $h = $h.Replace('{{ANIO}}', (Get-Date).Year)
    return $h
}

function JsonLd {
    param([string]$nombre, [string]$desc, [string]$url)
    $j  = "{`n"
    $j += '  "@context": "https://schema.org",' + "`n"
    $j += '  "@type": "CollectionPage",' + "`n"
    $j += '  "name": "' + (Esc $nombre) + '",' + "`n"
    $j += '  "description": "' + (Esc $desc) + '",' + "`n"
    $j += '  "url": "' + (Esc $url) + '",' + "`n"
    $j += '  "inLanguage": "es-CO",' + "`n"
    $j += '  "isPartOf": { "@type": "WebSite", "url": "' + $Sitio + '/" }' + "`n"
    $j += '}'
    return '<script type="application/ld+json">' + "`n" + $j + "`n" + '</script>'
}

function Miga {
    param([string]$actual, [hashtable]$padres, [int]$Nivel = 1)
    $out = @()
    $out += ('<a href="' + (RutaInterna '' $Nivel) + '">Inicio</a>')
    foreach ($k in $padres.Keys) { $out += $padres[$k] }
    $out += $actual
    return $out
}

# ============================================
# 4. PAGINAS DE MARCA
# ============================================
Titulo '3. Generando paginas de marca...'

foreach ($m in $marcas) {
    $sMarca = Slug $m.Marca
    $nombreM = NombreMarca $m.Marca
    $url = $Sitio + '/' + $sMarca + '/'
    $h1 = 'Repuestos y accesorios para camiones ' + $nombreM + ' en Bogota'
    $intro = 'Encuentra repuestos y accesorios para camiones ' + $nombreM + ' en Bogota. Elige el modelo de tu camion para ver solo las piezas que le corresponden. Envios a toda Colombia.'
    $total = ($m.Modelos | ForEach-Object { $_.Productos.Count } | Measure-Object -Sum).Sum

    $lis = @()
    foreach ($mo in $m.Modelos) {
        $nombreModelo = LimpiarModelo -modelo $mo.Modelo -marca $m.Marca
        $lis += ('          <li><a href="' + (SlugModelo -modelo $mo.Modelo -marca $m.Marca) + '/">' + (Esc $nombreModelo) + '</a> <span class="contador-modelo">' + $mo.Productos.Count + ' productos</span></li>')
    }
    $listaHtml = "      <ul class=`"lista-modelos`">`n" + ($lis -join "`n") + "`n      </ul>"

    $todos = @($m.Modelos | ForEach-Object { $_.Productos })
    $extra = ''
    $extra += (Bloque -titulo ('Modelos de camiones ' + $nombreM) -contenido $listaHtml -nota '')
    $extra += (Bloque -titulo ('Productos para camiones ' + $nombreM) -contenido (GridProductos -Items $todos -Limite 36 -Nivel 1) -nota '')

    $migas = Miga -actual (Esc $nombreM) -padres @{} -Nivel 1
    $html = ConstruirPagina -Titulo ($h1 + ' | Lujos y Accesorios') -Descripcion $intro -H1 $h1 `
        -Intro $intro -Migas $migas -Extra $extra -Nivel 1 -Url $url -JsonLd (JsonLd $h1 $intro $url)

    if (-not $SoloSimular) { Subir (Join-Path $Raiz ($sMarca + '\index.html')) $html }
    $urls.Add($url) | Out-Null
    Ok ($nombreM + ' (' + $total + ' productos, ' + $m.Modelos.Count + ' modelos)')
}

# ============================================
# 5. PAGINAS DE MODELO
# ============================================
Titulo '4. Generando paginas de modelo...'

foreach ($m in $marcas) {
    $sMarca = Slug $m.Marca
    $nombreM = NombreMarca $m.Marca
    foreach ($mo in $m.Modelos) {
        $nombreModelo = LimpiarModelo -modelo $mo.Modelo -marca $m.Marca
        $sModelo = SlugModelo -modelo $mo.Modelo -marca $m.Marca
        $url = $Sitio + '/' + $sMarca + '/' + $sModelo + '/'
        $h1 = 'Repuestos para camiones ' + $nombreM + ' ' + $nombreModelo
        $intro = 'Repuestos y accesorios para camiones ' + $nombreM + ' ' + $nombreModelo + ' en Bogota. Si no encuentras la pieza que necesitas, envianos una foto por WhatsApp y te ayudamos a identificarla.'
        $migas = Miga -actual (Esc $nombreModelo) -padres @{ 'marca' = ('<a href="' + (RutaInterna $sMarca 2) + '">' + (Esc $nombreM) + '</a>') } -Nivel 2
        $grid = GridProductos -Items $mo.Productos -Limite 48 -Nivel 2
        $extra = Bloque -titulo ('Repuestos disponibles para ' + $nombreM + ' ' + $nombreModelo) -contenido $grid -nota '&#128247; No ves la pieza que necesitas? Envianos una foto por WhatsApp y verificamos disponibilidad.'
        $html = ConstruirPagina -Titulo ($h1 + ' | Lujos y Accesorios') -Descripcion $intro -H1 $h1 `
            -Intro $intro -Migas $migas -Extra $extra -Nivel 2 -Url $url -JsonLd (JsonLd $h1 $intro $url)
        if (-not $SoloSimular) { Subir (Join-Path $Raiz ($sMarca + '\' + $sModelo + '\index.html')) $html }
        $urls.Add($url) | Out-Null
        Ok ($nombreM + ' ' + $nombreModelo + ' (' + $mo.Productos.Count + ' productos)')
    }
}

# ============================================
# 6. PAGINAS DE CATEGORIA
# ============================================
Titulo '5. Generando paginas de categoria...'

foreach ($cat in $Categorias) {
    $items = @()
    foreach ($m in $marcas) {
        foreach ($mo in $m.Modelos) {
            foreach ($p in $mo.Productos) {
                if ($p.Existe -and $p.Nombre -match $cat.p) {
                    $items += [pscustomobject]@{
                        Id       = $p.Id
                        Nombre   = $p.Nombre
                        Imagen   = $p.Imagen
                        Existe   = $p.Existe
                        Contexto = ((NombreMarca $m.Marca) + ' ' + (LimpiarModelo -modelo $mo.Modelo -marca $m.Marca))
                    }
                }
            }
        }
    }

    if ($items.Count -eq 0) {
        Aviso ($cat.s + ': sin productos reales, se omite (no se crean paginas vacias)')
        continue
    }

    $url = $Sitio + '/productos/' + $cat.s + '/'
    $h1 = $cat.n + ' para camiones en Bogota'
    $intro = $cat.n + ' para camiones livianos y pesados de Chevrolet, JAC, Foton y JMC. Atencion en Bogota y envios a toda Colombia. Si no encuentras tu pieza, envianos una foto por WhatsApp.'
    $migas = Miga -actual (Esc $cat.n) -padres @{ 'cat' = ('<a href="' + (RutaInterna 'repuestos-para-camiones' 2) + '">Repuestos</a>') } -Nivel 2
    $grid = GridProductos -Items $items -Limite 48 -Nivel 2 -ConContexto
    $nota = '&#128247; Mostrando ' + $items.Count + ' producto(s) de esta categoria. No aparece el tuyo? Envianos una foto.'
    $extra = Bloque -titulo ($cat.n + ' para camiones') -contenido $grid -nota $nota
    $html = ConstruirPagina -Titulo ($h1 + ' | Lujos y Accesorios') -Descripcion $intro -H1 $h1 `
        -Intro $intro -Migas $migas -Extra $extra -Nivel 2 -Url $url -JsonLd (JsonLd $h1 $intro $url)

    if (-not $SoloSimular) { Subir (Join-Path $Raiz ('productos\' + $cat.s + '\index.html')) $html }
    $urls.Add($url) | Out-Null
    $CategoriasUsadas.Add($cat.s) | Out-Null
    Ok ($cat.s + ' (' + $items.Count + ' productos)')
}

# ============================================
# 7. PAGINAS DE PRIMER NIVEL
# ============================================
Titulo '6. Generando paginas de primer nivel...'

foreach ($pg in $Nivel1) {
    $url = $Sitio + '/' + $pg.s + '/'
    $h1 = $pg.h + ' en Bogota'
    $migas = Miga -actual (Esc $pg.h) -padres @{} -Nivel 1

    $catLinks = @()
    foreach ($cat in $Categorias) {
        if ($CategoriasUsadas -contains $cat.s) {
            $catLinks += ('          <a class="categoria-card" href="' + (RutaInterna ('productos/' + $cat.s) 1) + '">' + (Esc $cat.n) + '</a>')
        }
    }
    $catHtml = "      <div class=`"categorias-grid`">`n" + ($catLinks -join "`n") + "`n      </div>"

    $extra  = Bloque -titulo 'Categorias' -contenido $catHtml -nota ''
    $extra += Bloque -titulo $pg.h -contenido (GridProductos -Items $TodosProductos -Limite 36 -Nivel 1) -nota ''

    $html = ConstruirPagina -Titulo ($h1 + ' | Lujos y Accesorios') -Descripcion $pg.d -H1 $h1 `
        -Intro $pg.d -Migas $migas -Extra $extra -Nivel 1 -Url $url -JsonLd (JsonLd $h1 $pg.d $url)
    if (-not $SoloSimular) { Subir (Join-Path $Raiz ($pg.s + '\index.html')) $html }
    $urls.Add($url) | Out-Null
    Ok $pg.s
}

# ============================================
# 8. PAGINAS LEGALES
# ============================================
Titulo '7. Generando paginas legales...'

$Legales = @(
    [pscustomobject]@{
        s = 'politica-privacidad'
        h = 'Politica de Privacidad'
        i = 'Como tratamos tus datos personales en Lujos y Accesorios.'
        c = @(
            '<h2>Que datos recogemos</h2>',
            '<p>Cuando nos escribes por WhatsApp o por telefono para cotizar un repuesto podemos recibir tu nombre, tu numero de contacto, la referencia del camion que manejas y las fotos que nos envies para identificar una pieza.</p>',
            '<h2>Para que los usamos</h2>',
            '<p>Usamos esa informacion unicamente para atender tu solicitud: cotizarte, confirmar la compatibilidad de una pieza, coordinar la entrega o responder tus preguntas.</p>',
            '<h2>Con quien los compartimos</h2>',
            '<p>No vendemos ni cedemos tus datos a terceros. Solo se comparten con el servicio de mensajeria o courier cuando sea necesario para enviarte un pedido.</p>',
            '<h2>Tus derechos</h2>',
            ('<p>Puedes pedirnos informacion sobre los datos que tenemos de ti, corregirlos o solicitar su eliminacion. Escribenos por WhatsApp al ' + $Telefono + ' y lo atendemos.</p>'),
            '<h2>Cambios en esta politica</h2>',
            '<p>Podemos actualizar este documento. La version vigente siempre sera la publicada en esta pagina.</p>'
        ) -join "`n        "
    }
    [pscustomobject]@{
        s = 'politica-cookies'
        h = 'Politica de Cookies'
        i = 'Que cookies y tecnologias similares usa este sitio web.'
        c = @(
            '<h2>Que son las cookies</h2>',
            '<p>Las cookies son pequenos archivos que el navegador guarda en tu equipo. Este sitio las usa para funciones tecnicas y, si se activa, para medicion de visitas.</p>',
            '<h2>Cookies que usamos</h2>',
            '<ul>',
            '<li><strong>Tecnicas:</strong> necesarias para que el sitio funcione, como recordar tu preferencia de tema claro u oscuro.</li>',
            '<li><strong>De medicion:</strong> solo si se configura Google Analytics con el identificador del negocio. Mientras ese identificador no este configurado, no se carga ningun sistema de medicion.</li>',
            '</ul>',
            '<h2>Cookies de terceros</h2>',
            '<p>Al mostrar videos de TikTok y el mapa de Google, esos servicios pueden instalar sus propias cookies. Puedes revisarlas en la configuracion de privacidad de cada plataforma.</p>',
            '<h2>Como controlarlas</h2>',
            '<p>Puedes borrar o bloquear las cookies desde la configuracion de tu navegador. Algunas funciones del sitio podrian dejar de operar correctamente.</p>'
        ) -join "`n        "
    }
)

foreach ($lg in $Legales) {
    $url = $Sitio + '/' + $lg.s + '/'
    $migas = Miga -actual (Esc $lg.h) -padres @{} -Nivel 1
    $extra = "`n      <section class=`"pagina-bloque`">`n        " + $lg.c + "`n      </section>"
    $html = ConstruirPagina -Titulo ($lg.h + ' | Lujos y Accesorios') -Descripcion $lg.i -H1 $lg.h `
        -Intro $lg.i -Migas $migas -Extra $extra -Nivel 1 -Url $url -JsonLd ''
    if (-not $SoloSimular) { Subir (Join-Path $Raiz ($lg.s + '\index.html')) $html }
    $urls.Add($url) | Out-Null
    Ok $lg.s
}

# ============================================
# 9. MAPA DE RUTAS PARA LOS PRODUCTOS DESTACADOS
# ============================================
# La cinta "Productos destacados" de la home necesita saber a que pagina real
# lleva cada producto. Este archivo se genera DESPUES de crear las paginas y
# solo incluye entradas cuyo archivo existe de verdad: si la pagina no se
# genero, el producto no se registra y en la interfaz se avisa con un
# comentario, en lugar de crear paginas vacias.
Titulo '9. Generando mapa de rutas de productos (js/rutas-productos.js)...'

$mapa = New-Object System.Collections.Generic.List[string]
$sinRuta = 0

foreach ($m in $marcas) {
    $sMarca = Slug $m.Marca
    foreach ($mo in $m.Modelos) {
        $sModelo = SlugModelo -modelo $mo.Modelo -marca $m.Marca
        foreach ($p in $mo.Productos) {
            if (-not $p.Existe) { continue }

            # Prioridad 1: pagina de categoria. Prioridad 2: pagina de modelo.
            $destino = $null
            $tipo = ''
            foreach ($cat in $Categorias) {
                if ($p.Nombre -match $cat.p) {
                    $archivo = Join-Path $Raiz ('productos\' + $cat.s + '\index.html')
                    if (Test-Path $archivo) {
                        $destino = 'productos/' + $cat.s + '/index.html'
                        $tipo = 'categoria'
                    }
                    break
                }
            }
            if (-not $destino) {
                $archivo = Join-Path $Raiz ($sMarca + '\' + $sModelo + '\index.html')
                if (Test-Path $archivo) {
                    $destino = $sMarca + '/' + $sModelo + '/index.html'
                    $tipo = 'modelo'
                }
            }

            if ($destino) {
                $mapa.Add(("    '{0}': {{ ruta: '{1}', tipo: '{2}', nombre: '{3}' }}," -f `
                    $p.Id, $destino, $tipo, (Esc $p.Nombre))) | Out-Null
            } else {
                $sinRuta++
            }
        }
    }
}

$js = "// Generado por generar-paginas.ps1 - NO EDITAR A MANO`n"
$js += "// Mapa producto -> pagina real. Solo incluye destinos que existen en disco.`n"
$js += "// Sin entrada significa: no hay pagina real para ese producto (no se inventa).`n`n"
$js += "const RUTAS_PRODUCTOS = {`n"
$js += ($mapa -join "`n")
$js += "`n};`n"

if (-not $SoloSimular) {
    [System.IO.File]::WriteAllText((Join-Path $Raiz 'js\rutas-productos.js'), $js, $Utf8)
}
Ok ('js/rutas-productos.js (' + $mapa.Count + ' productos con pagina real)')
if ($sinRuta -gt 0) {
    Aviso ($sinRuta.ToString() + ' productos SIN pagina real: se dejaran sin enlace (no se crean paginas vacias)')
}

# ============================================
# 10. SITEMAP, ROBOTS, .NOJEKYLL
# ============================================
Titulo '8. Generando sitemap.xml, robots.txt y .nojekyll...'

if ($Sitio) {
    $entradas = New-Object System.Collections.Generic.List[string]
    $entradas.Add('  <url>' + "`n    <loc>" + $Sitio + '/</loc>' + "`n    <changefreq>weekly</changefreq>`n    <priority>1.0</priority>`n  </url>") | Out-Null
    foreach ($u in $urls) {
        $pri = '0.7'
        if ($u -like '*politica-*') { $pri = '0.3' }
        if ($u -like '*repuestos-para-camiones*' -or $u -like '*accesorios-para-camiones*' -or $u -like '*lujos-para-camiones*') { $pri = '0.9' }
        $entradas.Add('  <url>' + "`n    <loc>" + $u + '</loc>' + "`n    <changefreq>monthly</changefreq>`n    <priority>" + $pri + "</priority>`n  </url>") | Out-Null
    }
    $sitemap = '<?xml version="1.0" encoding="UTF-8"?>' + "`n"
    $sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + "`n"
    $sitemap += ($entradas -join "`n")
    $sitemap += "`n</urlset>`n"

    $robots = "User-agent: *`nAllow: /`nDisallow: /admin/`n`nSitemap: $Sitio/sitemap.xml`n"

    if (-not $SoloSimular) {
        [System.IO.File]::WriteAllText((Join-Path $Raiz 'sitemap.xml'), $sitemap, $Utf8)
        [System.IO.File]::WriteAllText((Join-Path $Raiz 'robots.txt'), $robots, $Utf8)
        $nj = Join-Path $Raiz '.nojekyll'
        if (-not (Test-Path $nj)) { [System.IO.File]::WriteAllText($nj, '', $Utf8) }
    }
    Ok ('sitemap.xml (' + ($urls.Count + 1) + ' URLs)')
    Ok 'robots.txt'
    Ok '.nojekyll'
} else {
    Aviso 'Sin dominio: no se generaron sitemap.xml ni robots.txt'
}

# ============================================
# RESUMEN
# ============================================
Write-Host "`n========================================" -ForegroundColor White
Write-Host '  RESUMEN' -ForegroundColor White
Write-Host '========================================' -ForegroundColor White
Write-Host ('  Sitio:             ' + $Sitio)
Write-Host ('  Marcas:            ' + $TotalMarcas)
Write-Host ('  Modelos:           ' + $TotalModelos)
Write-Host ('  Productos:         ' + $TotalProductos)
if ($SoloSimular) {
    Write-Host '  Modo simulacion:   no se escribieron archivos'
} else {
    Write-Host ('  Paginas generadas: ' + $paginasCreadas.Count)
    Write-Host ('  URLs en sitemap:   ' + ($urls.Count + 1))
}
Write-Host '========================================' -ForegroundColor White

if (-not $Sitio) {
    Aviso 'El dominio quedo vacio. Revisa SITE_CONFIG.siteUrl en js/config.js'
    Aviso 'y vuelve a ejecutar el generador antes de publicar.'
}
