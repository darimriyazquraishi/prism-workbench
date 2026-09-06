param(
    [string]$DestinationPath = "F:\corewithin\LUMI_Desktop"
)

Write-Host "Creating standalone application package in: $DestinationPath"

if (-not (Test-Path $DestinationPath)) {
    New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null
}

# 1. Executables
Copy-Item "F:\corewithin\LUMI.exe" -Destination $DestinationPath
if (Test-Path "F:\corewithin\launcher\app.ico") {
    Copy-Item "F:\corewithin\launcher\app.ico" -Destination $DestinationPath
}

# 2. Native WebView2 Runtime DLLs
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.WinForms.dll" -Destination $DestinationPath
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.Core.dll" -Destination $DestinationPath
Copy-Item "F:\corewithin\WebView2Loader.dll" -Destination $DestinationPath

# 3. Built Frontend Web Application (dist)
if (Test-Path "$DestinationPath\dist") {
    Remove-Item -Path "$DestinationPath\dist" -Recurse -Force
}
New-Item -ItemType Directory -Path "$DestinationPath\dist" -Force | Out-Null
if (Test-Path "F:\corewithin\dist\client") {
    Copy-Item "F:\corewithin\dist\client\*" -Destination "$DestinationPath\dist" -Recurse -Force
} else {
    Copy-Item "F:\corewithin\dist\*" -Destination "$DestinationPath\dist" -Recurse -Force
}

# 4. Demo Notes & Datasets (demo)
Copy-Item "F:\corewithin\demo" -Destination $DestinationPath -Recurse -Force

# 5. Local Models Directory (models) - folder structure & documentation only (exclude large weights)
New-Item -ItemType Directory -Path "$DestinationPath\models" -Force | Out-Null
if (Test-Path "F:\corewithin\models\README.md") {
    Copy-Item "F:\corewithin\models\README.md" -Destination "$DestinationPath\models\" -Force
}
$modelDirs = @("qwen3-14b", "qwen2.5-coder-7b", "qwen3-vl-8b", "qwen3-embedding-0.6b", "qwen3-reranker-0.6b")
foreach ($dir in $modelDirs) {
    $targetDir = "$DestinationPath\models\$dir"
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    Set-Content -Path "$targetDir\.gitkeep" -Value "# Placeholder for $dir model weights. Download model files here." -Encoding UTF8
}

# 6. Public Assets & Icons (public)
Copy-Item "F:\corewithin\public" -Destination $DestinationPath -Recurse -Force

# 7. Add Quick Launch Readme
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
- demo\                         : Datasets, inspection reports, meeting notes
- models\                       : Local open-weight models directory
- public\                       : Icons and media assets

======================================================================
"@

Set-Content -Path "$DestinationPath\README.txt" -Value $readmeContent -Encoding UTF8

Write-Host "Packaging complete!"
Get-ChildItem -Path $DestinationPath | Select-Object Name, Mode, Length
