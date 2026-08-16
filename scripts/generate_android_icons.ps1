Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\XAAJI XARASH\IMTAAELQAARI\public\app-logo.png"
if (-Not (Test-Path $srcPath)) {
    Write-Error "Source file not found: $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
$resBase = "C:\Users\XAAJI XARASH\IMTAAELQAARI\android\app\src\main\res"

function Generate-ResizedIcon($img, $width, $height, $outPath, $isRound, $isForeground) {
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $destImg = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($isForeground) {
        $padX = [int]($width * 0.16)
        $padY = [int]($height * 0.16)
        $drawW = $width - ($padX * 2)
        $drawH = $height - ($padY * 2)
        $innerRect = New-Object System.Drawing.Rectangle($padX, $padY, $drawW, $drawH)
        $g.DrawImage($img, $innerRect)
    } elseif ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $g.SetClip($path)
        $g.DrawImage($img, $destRect)
    } else {
        $g.DrawImage($img, $destRect)
    }

    $g.Dispose()
    
    $parentDir = Split-Path -Parent $outPath
    if (-Not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $destImg.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImg.Dispose()
    Write-Host "Generated: $outPath ($width x $height)"
}

# mdpi (1x)
Generate-ResizedIcon $srcImg 48 48 "$resBase\mipmap-mdpi\ic_launcher.png" $false $false
Generate-ResizedIcon $srcImg 48 48 "$resBase\mipmap-mdpi\ic_launcher_round.png" $true $false
Generate-ResizedIcon $srcImg 108 108 "$resBase\mipmap-mdpi\ic_launcher_foreground.png" $false $true

# hdpi (1.5x)
Generate-ResizedIcon $srcImg 72 72 "$resBase\mipmap-hdpi\ic_launcher.png" $false $false
Generate-ResizedIcon $srcImg 72 72 "$resBase\mipmap-hdpi\ic_launcher_round.png" $true $false
Generate-ResizedIcon $srcImg 162 162 "$resBase\mipmap-hdpi\ic_launcher_foreground.png" $false $true

# xhdpi (2x)
Generate-ResizedIcon $srcImg 96 96 "$resBase\mipmap-xhdpi\ic_launcher.png" $false $false
Generate-ResizedIcon $srcImg 96 96 "$resBase\mipmap-xhdpi\ic_launcher_round.png" $true $false
Generate-ResizedIcon $srcImg 216 216 "$resBase\mipmap-xhdpi\ic_launcher_foreground.png" $false $true

# xxhdpi (3x)
Generate-ResizedIcon $srcImg 144 144 "$resBase\mipmap-xxhdpi\ic_launcher.png" $false $false
Generate-ResizedIcon $srcImg 144 144 "$resBase\mipmap-xxhdpi\ic_launcher_round.png" $true $false
Generate-ResizedIcon $srcImg 324 324 "$resBase\mipmap-xxhdpi\ic_launcher_foreground.png" $false $true

# xxxhdpi (4x)
Generate-ResizedIcon $srcImg 192 192 "$resBase\mipmap-xxxhdpi\ic_launcher.png" $false $false
Generate-ResizedIcon $srcImg 192 192 "$resBase\mipmap-xxxhdpi\ic_launcher_round.png" $true $false
Generate-ResizedIcon $srcImg 432 432 "$resBase\mipmap-xxxhdpi\ic_launcher_foreground.png" $false $true

function Generate-SplashScreen($img, $width, $height, $outPath) {
    $destImg = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destImg)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    # Fill background with #221610 (Luxury Dark Heritage)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#221610"))
    $g.FillRectangle($brush, 0, 0, $width, $height)
    $brush.Dispose()

    # Draw centered logo (approx 40% of smallest dimension)
    $logoSize = [int]([Math]::Min($width, $height) * 0.45)
    $posX = [int](($width - $logoSize) / 2)
    $posY = [int](($height - $logoSize) / 2)
    $logoRect = New-Object System.Drawing.Rectangle($posX, $posY, $logoSize, $logoSize)
    $g.DrawImage($img, $logoRect)
    $g.Dispose()

    $parentDir = Split-Path -Parent $outPath
    if (-Not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }

    $destImg.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $destImg.Dispose()
    Write-Host "Generated Splash: $outPath ($width x $height)"
}

# Main drawable splash
Generate-SplashScreen $srcImg 512 512 "$resBase\drawable\splash.png"

# Portrait Splash Screens
Generate-SplashScreen $srcImg 320 480 "$resBase\drawable-port-mdpi\splash.png"
Generate-SplashScreen $srcImg 480 800 "$resBase\drawable-port-hdpi\splash.png"
Generate-SplashScreen $srcImg 640 960 "$resBase\drawable-port-xhdpi\splash.png"
Generate-SplashScreen $srcImg 960 1600 "$resBase\drawable-port-xxhdpi\splash.png"
Generate-SplashScreen $srcImg 1280 1920 "$resBase\drawable-port-xxxhdpi\splash.png"

# Landscape Splash Screens
Generate-SplashScreen $srcImg 480 320 "$resBase\drawable-land-mdpi\splash.png"
Generate-SplashScreen $srcImg 800 480 "$resBase\drawable-land-hdpi\splash.png"
Generate-SplashScreen $srcImg 960 640 "$resBase\drawable-land-xhdpi\splash.png"
Generate-SplashScreen $srcImg 1600 960 "$resBase\drawable-land-xxhdpi\splash.png"
Generate-SplashScreen $srcImg 1920 1280 "$resBase\drawable-land-xxxhdpi\splash.png"

$srcImg.Dispose()
Write-Host "All Android App Icons & Splash Screens generated successfully!"
