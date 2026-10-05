param(
    [int]$AnchoMaximo = 640,
    [int]$Calidad = 82,
    [string]$Carpeta = ""
)

# Optimiza las miniaturas de TikTok: la API oEmbed entrega imagenes de hasta
# 1.8 MB, demasiado pesadas para cargar en la seccion de trabajos.
#
# Es idempotente: se puede ejecutar tantas veces como haga falta.

Add-Type -AssemblyName System.Drawing

# La carpeta por defecto se resuelve desde la raiz del proyecto, no desde el
# directorio actual, para que el script funcione aunque se llame desde otro lado.
if ([string]::IsNullOrWhiteSpace($Carpeta)) {
    $Carpeta = Join-Path $PSScriptRoot "img\tiktok"
}
if (-not (Test-Path -LiteralPath $Carpeta)) {
    Write-Host "  No existe la carpeta: $Carpeta" -ForegroundColor Red
    exit 1
}

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }

Get-ChildItem $Carpeta -Filter "video*.jpg" -File | ForEach-Object {
    $origen = $_.FullName
    $img = [System.Drawing.Image]::FromFile($origen)

    if ($img.Width -le $AnchoMaximo) {
        Write-Host ("  {0}  ya cabe ({1}x{2}, {3} KB) - sin cambios" -f $_.Name, $img.Width, $img.Height, [math]::Round($_.Length / 1KB))
        $img.Dispose()
        return
    }

    $alto = [int]($img.Height * ($AnchoMaximo / $img.Width))
    $mini = [System.Drawing.Bitmap]::new($AnchoMaximo, $alto)
    $g = [System.Drawing.Graphics]::FromImage($mini)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $AnchoMaximo, $alto)
    $g.Dispose()
    $img.Dispose()

    $params = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $params.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
        [System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)

    # GDI+ no puede sobrescribir el archivo de origen: se escribe un temporal
    # y se copia encima. No se usa Move-Item -Force porque falla con
    # "El proceso no puede acceder al archivo" si el destino ya existe
    # (el error que dejaba los temporales sin replacear).
    $temporal = $origen + '.tmp.jpg'
    if (Test-Path -LiteralPath $temporal) { Remove-Item -LiteralPath $temporal -Force }
    $mini.Save($temporal, $encoder, $params)
    $mini.Dispose()

    [System.IO.File]::Copy($temporal, $origen, $true)
    Remove-Item -LiteralPath $temporal -Force

    Write-Host ("  {0}  {1}x{2}  {3} KB" -f $_.Name, $AnchoMaximo, $alto, [math]::Round((Get-Item $origen).Length / 1KB))
}
