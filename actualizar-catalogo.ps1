# ============================================
# ACTUALIZAR CATALOGO DE LA WEB
# ============================================
# Lee las subcarpetas de  img\repuestos\  y genera js\catalogo.js
#
# ESTE SCRIPT USA UN MAPEO EXPLICITO de carpeta -> modelo(s).
# Las carpetas de img\repuestos se asignan a modelos reales de cada marca
# segun la tabla MAPEO_CARPETAS de abajo.
#
# Para cambiar que carpeta va a que modelo, edita MAPEO_CARPETAS.
#
# USO: clic derecho sobre este archivo > "Ejecutar con PowerShell"
# ============================================

$ErrorActionPreference = 'Stop'

$raizWeb = Split-Path -Parent $MyInvocation.MyCommand.Path
$carpetaRepuestos = Join-Path $raizWeb 'img\repuestos'
$archivoJs = Join-Path $raizWeb 'js\catalogo.js'

$extensiones = '.jpg', '.jpeg', '.png', '.webp'

# ============================================
# ORDEN DE LOS REPUESTOS EN LA WEB
# ============================================
$ordenPrioridad = @('unidad', 'direccional', 'persiana', 'estribo', 'puntera')

function Obtener-Prioridad {
    param([string]$nombreArchivo)
    $n = $nombreArchivo.ToLower()
    for ($i = 0; $i -lt $ordenPrioridad.Count; $i++) {
        if ($n -eq $ordenPrioridad[$i]) { return $i * 3 }
    }
    for ($i = 0; $i -lt $ordenPrioridad.Count; $i++) {
        if ($n.StartsWith($ordenPrioridad[$i])) { return $i * 3 + 1 }
    }
    for ($i = 0; $i -lt $ordenPrioridad.Count; $i++) {
        if ($n.Contains($ordenPrioridad[$i])) { return $i * 3 + 2 }
    }
    return $ordenPrioridad.Count * 3
}

# ============================================
# MAPEO DE CARPETAS A MODELOS
# Formato:  'nombre exacto de la carpeta' = @('MODELO1','MODELO2'...)
#   - Un solo modelo  -> esos repuestos salen SOLO en ese modelo
#   - Varios modelos  -> esos repuestos salen en TODOS esos modelos
#   - '*' (sin modelo) -> repuestos generales de la marca (Appl. a todos)
# ============================================
$MAPEO_CARPETAS = @{
    # ===== CHEVROLET =====
    'chevrolet caregato hasta-2011'            = @('NHR', 'NPR', 'NQR', 'NKR')
    'chevrolet Doble farola 98-2001'           = @('NHR', 'NPR', 'NQR', 'NKR')
    'chevrolet reward 2012+'                   = @('NHR', 'NPR', 'NQR', 'NKR')
    'chevrolet FRR'                            = @('FRR')
    'chevrolet FTR'                            = @('FTR')

    # ===== FOTON =====
    'foton 2020-2024 farola acostada'          = @('FHR', 'FQR', 'FRR', 'FKR')
    'foton 2020-2024 farola parada'            = @('FHR', 'FQR', 'FRR', 'FKR')
    'foton olin 2005-2012'                     = @('OLLIN')

    # ===== JAC =====
    'jac 2005-2012 codigo serial 1035,1040,1042,1048,1061,1083' = @('JAC 1035,1040,1042,1048,1061,1083')
    'jac power 2015-2024'                      = @('POWER')
    'jac power euro 6 2025-2026'               = @('POWER EURO 6')

    # ===== JMC =====
    'jmc 2020-2024'                            = @('CHR', 'CQR', 'CKR')
    'jmc euro 6 2024-2026'                     = @('CHR Euro 6', 'CQR Euro 6', 'CKR Euro 6')
}

# ============================================
# ANIOS POR MARCA (default si la carpeta no los tiene explicitos)
# Formato: 'carpeta' = @(desde, hasta). $null = sin limite.
# Si una carpeta no esta aqui, no filtra por anio (aplica a todos).
# ============================================
$MAPEO_ANIOS = @{
    # —— Chevrolet: cada carpeta filtrada por su rango exacto ——
    # 'doble farola'  = (@(1998, 2001)  la carpeta se llamaba "98-2001"
    'chevrolet Doble farola 98-2001'    = @(1998, 2001)
    'chevrolet reward 2012+'            = @(2012, $null)
    'chevrolet reward'                  = @(2012, $null)
    # 'cherolet careGato hasta-2011' se detecta automatico por la regla especial
    # (carpeta "caregato ... hasta-2011" -> [2002, 2011]) mas abajo.

    'foton olin 2005-2012'      = @($null, $null)  # OLLIN: sin filtro de anio
}

# Para JMC/Ollin queremos que NO filtre por anio (aplica a todos).
# El script solo aplica anios si la clave existe en MAPEO_ANIOS o si la
# carpeta trae el rango en el nombre. Para forzar "sin filtro" en OLLIN y
# en las carpetas JAC/JMC, simplemente no los listamos aqui y usamos la
# regla de abajo.

function Convertir-NombreRepuesto {
    param([string]$nombreArchivo)
    $n = $nombreArchivo -replace '[-_]+', ' '
    $n = ($n -split '\s+' | ForEach-Object { if ($_) { $_.Substring(0, 1).ToUpper() + $_.Substring(1).ToLower() } }) -join ' '
    return $n.Trim()
}

if (-not (Test-Path -LiteralPath $carpetaRepuestos)) {
    Write-Host "No encontre la carpeta img\repuestos" -ForegroundColor Yellow
    exit
}

$catalogo = [ordered]@{}
$totalImagenes = 0
$carpetas = Get-ChildItem -LiteralPath $carpetaRepuestos -Directory | Sort-Object Name

foreach ($carpeta in $carpetas) {
    $nombreCarpeta = $carpeta.Name.Trim()

    # ---- Determinar la marca (primera palabra conocida) ----
    $marca = $null
    foreach ($m in @('chevrolet', 'jac', 'foton', 'jmc')) {
        if ($nombreCarpeta.ToLower().StartsWith($m)) { $marca = $m; break }
    }
    if (-not $marca) {
        Write-Host ("  OMITIDA '{0}': la carpeta debe empezar con la marca (chevrolet, jac, foton, jmc)" -f $carpeta.Name) -ForegroundColor Yellow
        continue
    }
    $marcaBonita = $marca.Substring(0, 1).ToUpper() + $marca.Substring(1)

    # ---- Modelos asignados desde el mapeo ----
    $modelos = $MAPEO_CARPETAS[$carpeta.Name]
    if (-not $modelos) {
        Write-Host ("  OMITIDA '{0}': no esta en MAPEO_CARPETAS. Agregala al script." -f $carpeta.Name) -ForegroundColor Yellow
        continue
    }

    # ---- Recolectar imagenes ----
    $imagenes = Get-ChildItem -LiteralPath $carpeta.FullName -File |
        Where-Object { $extensiones -contains $_.Extension.ToLower() } |
        Sort-Object -Property @{ Expression = { Obtener-Prioridad $_.BaseName } }, @{ Expression = { $_.Name } }

    if (-not $imagenes) {
        Write-Host ("  VACIA '{0}': no tiene imagenes todavia" -f $carpeta.Name) -ForegroundColor DarkGray
        continue
    }

    if (-not $catalogo.Contains($marcaBonita)) {
        $catalogo[$marcaBonita] = [ordered]@{}
    }

    # ---- Anios ----
    # Solo aplica rango de anios si la carpeta trae años explícitos en el
    # nombre O esta en MAPEO_ANIOS. Para OLLIN, JAC y JMC (que el usuario
    # quiere "sin importar año") NO aplicamos filtro de año.
    $anios = $null
    $nombreLower = $nombreCarpeta.ToLower()
    $noFiltrarAnio = $nombreLower.Contains('olin') -or
                     $nombreLower.Contains('codigo serial') -or
                     $nombreLower.Contains('2015-2024') -or
                     $nombreLower.Contains('2025-2026') -or
                     $nombreLower.Contains('2020-2024') -or
                     $nombreLower.Contains('2024-2026')
    if (-not $noFiltrarAnio) {
        if ($MAPEO_ANIOS.ContainsKey($carpeta.Name)) {
            $anios = $MAPEO_ANIOS[$carpeta.Name]
        } else {
            $matchRango = [regex]::Match($nombreLower, '(\d{4})\s*-\s*(\d{4})')
            $matchDesde = [regex]::Match($nombreLower, '(\d{4})\s*\+')
            $matchHasta = [regex]::Match($nombreLower, 'hasta\s*-?\s*(\d{4})')
            if ($nombreLower.Contains('caregato') -and $matchHasta.Success) {
                $anios = @(2002, [int]$matchHasta.Groups[1].Value)
            } elseif ($matchRango.Success) {
                $anios = @([int]$matchRango.Groups[1].Value, [int]$matchRango.Groups[2].Value)
            } elseif ($matchDesde.Success) {
                $anios = @([int]$matchDesde.Groups[1].Value, $null)
            } elseif ($matchHasta.Success) {
                $anios = @($null, [int]$matchHasta.Groups[1].Value)
            }
        }
    }

    # ---- Generar repuestos para cada modelo asignado ----
    $sufijoCarpeta = $carpeta.Name.ToLower() -replace '[^a-z0-9]+', '-'
    $sufijoCarpeta = $sufijoCarpeta.Trim('-')

    foreach ($modelo in $modelos) {
        $claveModelo = $modelo
        if (-not $catalogo[$marcaBonita].Contains($claveModelo)) {
            $catalogo[$marcaBonita][$claveModelo] = @()
        }

        foreach ($img in $imagenes) {
            $totalImagenes++
            $nombreBonito = Convertir-NombreRepuesto $img.BaseName

            # ID: marca-modelo-repuesto-carpeta (sufijo para evitar duplicados)
            $modeloSlug = ($modelo.ToLower() -replace '[^a-z0-9]+', '-')
            $id = ("{0}-{1}-{2}" -f $marca, $modeloSlug, $img.BaseName)
            $id = $id -replace '[^a-z0-9]+', '-'
            $id = $id.Trim('-')
            if ($sufijoCarpeta) { $id = "$id-$sufijoCarpeta" }

            $rep = [ordered]@{
                id = $id
                nombre = $nombreBonito
                img = ('img/repuestos/' + $carpeta.Name + '/' + $img.Name) -replace '\\', '/'
                categoria = 'Catalogo'
            }
            if ($anios) { $rep.anios = $anios }

            $catalogo[$marcaBonita][$claveModelo] = @($catalogo[$marcaBonita][$claveModelo]) + @($rep)
        }
    }

    $etiqueta = if ($anios) { " (anos $($anios[0])-$($anios[1]))" } else { " (todos)" }
    Write-Host ("  {0} > {1}{2}: {3} repuestos" -f $marcaBonita, ($modelos -join '/'), $etiqueta, $imagenes.Count) -ForegroundColor Green
}

$json = $catalogo | ConvertTo-Json -Depth 6

$contenido = @"
// ============================================
// CATALOGO GENERADO AUTOMATICAMENTE
// NO EDITAR A MANO
// Generado por actualizar-catalogo.ps1
// Para regenerar: ejecuta actualizar-catalogo.ps1
// ============================================

const CATALOGO = $json;
"@

[System.IO.File]::WriteAllText($archivoJs, $contenido, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " Catalogo actualizado" -ForegroundColor Cyan
Write-Host " Total imagenes (con repeticion por modelo): $totalImagenes" -ForegroundColor Cyan
Write-Host " Archivo: js\catalogo.js" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
