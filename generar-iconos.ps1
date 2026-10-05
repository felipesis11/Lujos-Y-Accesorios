param(
    [string]$RutaBase = "img\hero\camion-hero.png",
    [string]$CarpetaSalida = "img"
)

# Genera iconos PWA cuadrados (192, 512) y apple-touch-icon (180).
# Los anteriores eran copias de la foto del camion: no eran cuadrados
# ni cumplian el area segura de los iconos "maskable".

Add-Type -AssemblyName System.Drawing

$Azul  = [System.Drawing.Color]::FromArgb(11, 31, 58)
$Rojo  = [System.Drawing.Color]::FromArgb(196, 22, 28)
$Blanco = [System.Drawing.Color]::White

$imagenBase = [System.Drawing.Image]::FromFile((Resolve-Path $RutaBase).Path)

# Tamano del contenido dentro del icono.
# En un icono maskable el area segura es el 80% central,
# por eso el camion ocupa ~60% del lienzo.
$contenido = 0.60

function CrearIcono {
    param([int]$Lado, [string]$Nombre)

    $bmp = [System.Drawing.Bitmap]::new($Lado, $Lado)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Fondo a sangre con la identidad de color de la marca
    $fondo = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new($Lado, $Lado),
        $Azul, $Rojo)
    $g.FillRectangle($fondo, 0, 0, $Lado, $Lado)

    # Banda roja inferior
    $g.FillRectangle([System.Drawing.SolidBrush]::new($Rojo), 0, [int]($Lado * 0.94), $Lado, [int]($Lado * 0.06))

    # Camion centrado respetando la proporcion original
    [double]$max = $Lado * $contenido
    $escala = [Math]::Min($max / $imagenBase.Width, ($max * 0.78) / $imagenBase.Height)
    $ancho = $imagenBase.Width * $escala
    $alto  = $imagenBase.Height * $escala
    $x = ($Lado - $ancho) / 2
    $y = ($Lado - $alto) / 2 - ($Lado * 0.03)
    $g.DrawImage($imagenBase, [double]$x, [double]$y, [double]$ancho, [double]$alto)

    # Iniciales de la marca bajo el camion
    [float]$tam = [Math]::Round($Lado * 0.115, 1)
    $fam = $null
    foreach ($nombreFam in @('Poppins', 'Segoe UI', 'Arial')) {
        $prueba = [System.Drawing.Font]::new($nombreFam, $tam, [System.Drawing.FontStyle]::Bold)
        if ($prueba.Name -eq $nombreFam) { $fam = $prueba; break }
        $prueba.Dispose()
    }
    if ($null -eq $fam) { $fam = [System.Drawing.Font]::new('Arial', $tam, [System.Drawing.FontStyle]::Bold) }

    $pincel = [System.Drawing.SolidBrush]::new($Blanco)
    $fmt = [System.Drawing.StringFormat]::new()
    $fmt.Alignment = [System.Drawing.StringAlignment]::Center
    $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = [System.Drawing.RectangleF]::new(0, [single]($Lado * 0.70), [single]$Lado, [single]($Lado * 0.22))
    $g.DrawString('LA', $fam, $pincel, $rect, $fmt)

    $fam.Dispose()
    $pincel.Dispose()
    $fmt.Dispose()
    $fondo.Dispose()
    $g.Dispose()

    $ruta = Join-Path (Get-Location) (Join-Path $CarpetaSalida $Nombre)
    $bmp.Save($ruta, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    $verif = [System.Drawing.Image]::FromFile($ruta)
    "  {0,-22} {1}x{2}  {3} KB" -f $Nombre, $verif.Width, $verif.Height, [math]::Round((Get-Item $ruta).Length / 1KB)
    $verif.Dispose()
}

"Generando iconos PWA desde $RutaBase"
CrearIcono -Lado 192 -Nombre 'icon-192.png'
CrearIcono -Lado 512 -Nombre 'icon-512.png'
CrearIcono -Lado 180 -Nombre 'apple-touch-icon.png'

$imagenBase.Dispose()
"Listo."
