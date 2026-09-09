param(
    [string]$DestinationPath = "F:\corewithin\LUMI_Desktop"
)

Write-Host "Creating standalone application package in: $DestinationPath"

if (-not (Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
}

# 1. Executables & Standalone Portable Runtimes
Copy-Item "F:\corewithin\LUMI.exe" -Destination $DestinationPath -Force
if (Test-Path "F:\corewithin\node.exe") {
    Copy-Item "F:\corewithin\node.exe" -Destination $DestinationPath -Force
} elseif (Test-Path "C:\Program Files\nodejs\node.exe") {
    Copy-Item "C:\Program Files\nodejs\node.exe" -Destination $DestinationPath -Force
}
if (Test-Path "F:\corewithin\launcher\app.ico") {
    Copy-Item "F:\corewithin\launcher\app.ico" -Destination $DestinationPath -Force
}

# 2. Native WebView2 Runtime DLLs
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.WinForms.dll" -Destination $DestinationPath -Force
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.Core.dll" -Destination $DestinationPath -Force
Copy-Item "F:\corewithin\WebView2Loader.dll" -Destination $DestinationPath -Force

# 3. Built Frontend Web Application (dist)
if (Test-Path "$DestinationPath\dist") {
    Remove-Item -Path "$DestinationPath\dist" -Recurse -Force
}
New-Item -ItemType Directory -Path "$DestinationPath\dist" -Force | Out-Null
Copy-Item "F:\corewithin\dist\*" -Destination "$DestinationPath\dist" -Recurse -Force
if (Test-Path "F:\corewithin\dist\client\index.html") {
    # Ensure index.html and assets are also present at root of dist for direct serving
    Copy-Item "F:\corewithin\dist\client\*" -Destination "$DestinationPath\dist" -Recurse -Force
    # Ensure dist\client is also intact
    if (-not (Test-Path "$DestinationPath\dist\client")) {
        New-Item -ItemType Directory -Path "$DestinationPath\dist\client" -Force | Out-Null
        Copy-Item "F:\corewithin\dist\client\*" -Destination "$DestinationPath\dist\client" -Recurse -Force
    }
}

# 4. Demo Notes & Datasets (demo)
Copy-Item "F:\corewithin\demo" -Destination $DestinationPath -Recurse -Force

# 5. Local Models Directory (clean structure, ready for user downloads)
$targetModels = "$DestinationPath\models"
if (-not (Test-Path $targetModels)) {
    New-Item -ItemType Directory -Path $targetModels -Force | Out-Null
}
$modelSubdirs = @("sdxl-lightning", "flux1-schnell", "unet", "text_encoders", "vae", "z-image-turbo", "qwen3-vl-8b", "qwen2.5-coder-7b", "qwen3-14b", "qwen3-embedding-0.6b", "qwen3-reranker-0.6b")
foreach ($sub in $modelSubdirs) {
    $subPath = "$targetModels\$sub"
    if (-not (Test-Path $subPath)) { New-Item -ItemType Directory -Path $subPath -Force | Out-Null }
    if (-not (Test-Path "$subPath\.gitkeep")) { New-Item -ItemType File -Path "$subPath\.gitkeep" -Force | Out-Null }
}
if (Test-Path "F:\corewithin\models\HOW_TO_ADD_MODELS.txt") {
    Copy-Item "F:\corewithin\models\HOW_TO_ADD_MODELS.txt" -Destination $targetModels -Force
}
if (Test-Path "F:\corewithin\models\Download_Recommended_Models.bat") {
    Copy-Item "F:\corewithin\models\Download_Recommended_Models.bat" -Destination $targetModels -Force
}

# 6. Local Inference Server Directory (llama_server)
if (Test-Path "F:\corewithin\llama_server") {
    $targetLlama = "$DestinationPath\llama_server"
    if (-not (Test-Path $targetLlama)) { New-Item -ItemType Directory -Path $targetLlama -Force | Out-Null }
    Get-ChildItem "F:\corewithin\llama_server\*" | ForEach-Object {
        try { Copy-Item $_.FullName -Destination $targetLlama -Force -ErrorAction Stop } catch {}
    }
}

# 7. Public Assets & Icons (public)
Copy-Item "F:\corewithin\public" -Destination $DestinationPath -Recurse -Force

# 8. Tools and Scripts for Local Neural Models & Image Generation
if (Test-Path "F:\corewithin\tools") {
    Copy-Item "F:\corewithin\tools" -Destination $DestinationPath -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "F:\corewithin\scripts") {
    Copy-Item "F:\corewithin\scripts" -Destination $DestinationPath -Recurse -Force -ErrorAction SilentlyContinue
}

# 8. Add Quick Launch Readme
$readmeContent = @"
======================================================================
  LUMI -- STANDALONE OFFLINE DESKTOP APPLICATION
======================================================================

HOW TO RUN:
1. Double-click "LUMI.exe".
2. The standalone desktop application window opens immediately.
   (No browser, no internet, no Node.js required)

FEATURES:
- 100% Offline: Operates completely air-gapped without requiring internet.
- Self-Contained: Uses the local "dist", "demo", and "models" folders directly.
- Native Desktop Window: Native minimize, maximize, and close controls.
- Keyboard Shortcuts:
    * F11: Toggle Fullscreen
    * F5 / Ctrl+R: Reload
    * F12: Developer Inspect Tools

FOLDER CONTENTS:
- LUMI.exe                      : Standalone native desktop executable
- *.dll                         : Native WebView2 offline rendering engines
- dist\                         : Pre-compiled application interface
- llama_server\                 : Local inference engine (auto-starts with LUMI.exe)
- demo\                         : Datasets, inspection reports, meeting notes
- models\                       : Local open-weight models directory
- public\                       : Icons and media assets

======================================================================
"@

Set-Content -Path "$DestinationPath\README.txt" -Value $readmeContent -Encoding UTF8

Write-Host "Packaging complete!"
Get-ChildItem -Path $DestinationPath | Select-Object Name, Mode, Length
