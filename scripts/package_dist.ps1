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

# 5. Local Models Directory (models)
if (Test-Path "F:\corewithin\models") {
    if (-not (Test-Path "$DestinationPath\models")) {
        try {
            New-Item -ItemType Junction -Path "$DestinationPath\models" -Target "F:\corewithin\models" -Force | Out-Null
        } catch {
            New-Item -ItemType Directory -Path "$DestinationPath\models" -Force | Out-Null
        }
    }
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
