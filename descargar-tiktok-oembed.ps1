param(
    [string]$Destino = "img\tiktok"
)

# Descarga las miniaturas REALES de los videos de TikTok desde el endpoint
# oficial oEmbed y las guarda localmente.
#
# Motivo: las imagenes que habia en img/tiktok/ eran la misma foto de un
# camion (1536x1024, horizontal) repetida tres veces, no capturas de los
# videos. Ademas, las URLs del CDN de TikTok son temporales y con firma
# expirable, por lo que no sirven como fallback permanente.
#
# Los textos (titulo) tambien se recuperan del mismo endpoint oficial,
# de modo que no se inventa contenido.

$ids = @(
    @{ id = '7647705813611498772'; archivo = 'video1.jpg' }
    @{ id = '7641617317150969108'; archivo = 'video2.jpg' }
    @{ id = '7650628791219260692'; archivo = 'video3.jpg' }
)

$cuenta = "lujosyaccesorioscamiones"
$salidaJson = New-Object System.Collections.Generic.List[string]
$salidaJson.Add('// Generado por descargar-tiktok-oembed.ps1 - datos oficiales de la API oEmbed de TikTok.') | Out-Null
$salidaJson.Add('// No editar a mano. Ejecutar: powershell -File descargar-tiktok-oembed.ps1') | Out-Null
$salidaJson.Add('') | Out-Null
$salidaJson.Add('const TIKTOK_OEMBED = {') | Out-Null

foreach ($v in $ids) {
    $url = "https://www.tiktok.com/oembed?url=https://www.tiktok.com/@$cuenta/video/$($v.id)"
    Write-Host "Consultando oEmbed: $($v.id)"

    try {
        $r = Invoke-RestMethod -Uri $url -TimeoutSec 40 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    } catch {
        Write-Warning "  No se pudo consultar $($v.id): $($_.Exception.Message)"
        continue
    }

    # Solo se aceptan datos del autor oficial configurado
    if ($r.author_unique_id -ne $cuenta) {
        Write-Warning "  ID ignorado: el autor es '$($r.author_unique_id)' y no es '$cuenta'"
        continue
    }

    # Imagen local desde la miniatura oficial
    $ruta = Join-Path (Get-Location) (Join-Path $Destino $v.archivo)
    try {
        Invoke-WebRequest -Uri $r.thumbnail_url -OutFile $ruta -TimeoutSec 60 -Headers @{ 'User-Agent' = 'Mozilla/5.0'; 'Referer' = 'https://www.tiktok.com/' }
        Add-Type -AssemblyName System.Drawing
        $img = [System.Drawing.Image]::FromFile($ruta)
        Write-Host ("  OK  {0}  {1}x{2}  {3} KB" -f $v.archivo, $img.Width, $img.Height, [math]::Round((Get-Item $ruta).Length / 1KB))
        $img.Dispose()
    } catch {
        Write-Warning "  No se pudo descargar la miniatura de $($v.id): $($_.Exception.Message)"
    }

    # Titulo real, recortado a una linea usable como etiqueta de la tarjeta
    $titulo = ($r.title -replace '\s+', ' ').Trim()
    if ($titulo.Length -gt 90) { $titulo = $titulo.Substring(0, 87).TrimEnd() + '...' }
    $titulo = $titulo -replace '(["\\])', '``$1'

    $salidaJson.Add("    '$($v.id)': {") | Out-Null
    $salidaJson.Add("        titulo: '$titulo',") | Out-Null
    $salidaJson.Add("        url: 'https://www.tiktok.com/@$cuenta/video/$($v.id)',") | Out-Null
    $salidaJson.Add("        imagen: 'img/tiktok/$($v.archivo)'") | Out-Null
    $salidaJson.Add('    },') | Out-Null
}

$salidaJson.Add('};') | Out-Null
$salidaJson.Add('') | Out-Null

$archivoJs = Join-Path (Get-Location) 'js\tiktok-oembed.js'
[System.IO.File]::WriteAllText($archivoJs, ($salidaJson -join "`n"), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "`nActualizado: js\tiktok-oembed.js"
