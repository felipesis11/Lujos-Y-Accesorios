param(
    [string]$Foto = "img\hero\camion-fondo.jpg",
    [string]$Salida = "img\og-image.jpg"
)

# Genera la imagen Open Graph (1200x630) reutilizando la foto real del hero.
# No inventa datos: solo usa marca, titular y contacto confirmados.

Add-Type -AssemblyName System.Drawing

$W = 1200
$H = 630
$Azul  = [System.Drawing.Color]::FromArgb(11, 31, 58)
$Rojo  = [System.Drawing.Color]::FromArgb(196, 22, 28)
$Blanco = [System.Drawing.Color]::White
$Gris  = [System.Drawing.Color]::FromArgb(198, 205, 214)

$rutaFoto = (Resolve-Path $Foto).Path
$img = [System.Drawing.Image]::FromFile($rutaFoto)

$bmp = New-Object System.Drawing.Bitmap($W, $H)

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

# Fondo: la foto real, recortada al formato 1200x630 con ajuste "cover"
$escala = [Math]::Max($W / $img.Width, $H / $img.Height)
$ancho = $img.Width * $escala
$alto  = $img.Height * $escala
$x = ($W - $ancho) / 2
$y = ($H - $alto) / 2
$g.DrawImage($img, $x, $y, $ancho, $alto)
$img.Dispose()

# Velo oscuro para que el texto tenga contraste
$velo = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Point(0, 0)),
    (New-Object System.Drawing.Point(0, $H)),
    [System.Drawing.Color]::FromArgb(205, $Azul),
    [System.Drawing.Color]::FromArgb(245, $Azul))
$g.FillRectangle($velo, 0, 0, $W, $H)

# Franja roja superior
$plumaRoja = New-Object System.Drawing.SolidBrush($Rojo)
$g.FillRectangle($plumaRoja, 0, 0, $W, 12)

function Fuente {
    param([float]$size, [System.Drawing.FontStyle]$style = [System.Drawing.FontStyle]::Regular)
    # Poppins puede no estar instalada en el equipo: se usa una familia disponible
    $estilo = [System.Drawing.FontStyle]$style
    $fuente = $null
    foreach ($familia in @('Poppins', 'Segoe UI', 'Arial', 'Tahoma')) {
        try {
            $f = New-Object System.Drawing.Font($familia, $size, $estilo)
            if ($f.Name -eq $familia) { $fuente = $f; break }
            $f.Dispose()
        } catch {}
    }
    if (-not $fuente) { $fuente = New-Object System.Drawing.Font('Arial', $size, $estilo) }
    return $fuente
}

# ---- Contenido ----
$formato = New-Object System.Drawing.StringFormat
$formato.Alignment = [System.Drawing.StringAlignment]::Near

$pincel = New-Object System.Drawing.SolidBrush($Blanco)

# Etiqueta superior
$etiqueta = New-Object System.Drawing.RectangleF(70, 78, 1060, 40)
$fuenteEtiqueta = Fuente 22 ([System.Drawing.FontStyle]::Bold)
$g.DrawString('REPUESTOS Y ACCESORIOS PARA CAMIONES', $fuenteEtiqueta, $pincel, $etiqueta, $formato)
$fuenteEtiqueta.Dispose()

# Titular
$titular = New-Object System.Drawing.RectangleF(70, 140, 1080, 230)
$fuenteTitular = Fuente 58 ([System.Drawing.FontStyle]::Bold)
$g.DrawString('Lujos y Accesorios', $fuenteTitular, $pincel, $titular, $formato)
$fuenteTitular.Dispose()

# Zonas de cobertura (informacion ya publicada en el sitio)
$cobertura = New-Object System.Drawing.RectangleF(70, 400, 1080, 60)
$fuenteCobertura = Fuente 32
$g.DrawString('Chevrolet - Foton - JAC - JMC   |   Bogota y todo el pais', $fuenteCobertura, $pincel, $cobertura, $formato)
$fuenteCobertura.Dispose()

# Linea roja de separacion
$g.FillRectangle($plumaRoja, 70, 490, 130, 6)

# Datos de contacto confirmados
$contacto = New-Object System.Drawing.RectangleF(70, 528, 1080, 60)
$fuenteContacto = Fuente 26
$g.DrawString('+57 312 469 2806   |   WhatsApp', $fuenteContacto, $pincel, $contacto, $formato)
$fuenteContacto.Dispose()

# Direccion
$direccion = New-Object System.Drawing.RectangleF(70, 570, 1080, 50)
$pincelGris = New-Object System.Drawing.SolidBrush($Gris)
$fuenteDireccion = Fuente 22
$g.DrawString('Calle 6A #17-59, La Estanzuela, Bogota', $fuenteDireccion, $pincelGris, $direccion, $formato)
$fuenteDireccion.Dispose()

# Guardar JPEG
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality, 88L)
$rutaSalida = Join-Path (Get-Location) $Salida
$bmp.Save($rutaSalida, $encoder, $params)

$bmp.Dispose()
$pincel.Dispose()
$pincelGris.Dispose()
$plumaRoja.Dispose()
$velo.Dispose()

$final = [System.Drawing.Image]::FromFile($rutaSalida)
"Generada: $Salida  ($($final.Width) x $($final.Height), $([math]::Round((Get-Item $rutaSalida).Length/1KB)) KB)"
$final.Dispose()
