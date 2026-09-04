param(
    [string]$DestinationPath = "F:\corewithin\LUMI_Desktop"
)

Write-Host "Creating standalone application package in: $DestinationPath"

if (Test-Path $DestinationPath) {
    Remove-Item -Path $DestinationPath -Recurse -Force
}
New-Item -ItemType Directory -Path $DestinationPath -Force | Out-Null

# 1. Executables
Copy-Item "F:\corewithin\LUMI.exe" -Destination $DestinationPath
Copy-Item "F:\corewithin\PrismWorkbench.exe" -Destination $DestinationPath

# 2. Native WebView2 Runtime DLLs
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.WinForms.dll" -Destination $DestinationPath
Copy-Item "F:\corewithin\Microsoft.Web.WebView2.Core.dll" -Destination $DestinationPath
Copy-Item "F:\corewithin\WebView2Loader.dll" -Destination $DestinationPath

# 3. Built Frontend Web Application (dist)
Copy-Item "F:\corewithin\dist" -Destination $DestinationPath -Recurse

# 4. Demo Notes & Datasets (demo)
Copy-Item "F:\corewithin\demo" -Destination $DestinationPath -Recurse

# 5. Local Models Directory (models)
Copy-Item "F:\corewithin\models" -Destination $DestinationPath -Recurse

# 6. Public Assets & Icons (public)
Copy-Item "F:\corewithin\public" -Destination $DestinationPath -Recurse

# 7. Add Quick Launch Readme
$readmeContent = @"
======================================================================
  LUMI / PRISM WORKBENCH — STANDALONE OFFLINE DESKTOP APPLICATION
======================================================================

HOW TO RUN:
1. Double-click "LUMI.exe" (or "PrismWorkbench.exe").
2. The standalone desktop application window will open immediately.

FEATURES:
- 100% Offline: Operates air-gapped without requiring an internet connection.
- Self-Contained: Uses the local "dist", "demo", and "models" folders directly.
- Native Desktop Window: Native minimize, maximize, and close controls.
- Keyboard Shortcuts:
    * F11: Toggle Fullscreen
    * F5 / Ctrl+R: Reload
    * F12: Developer Inspect Tools

FOLDER CONTENTS:
- LUMI.exe / PrismWorkbench.exe : Main desktop application executables
- *.dll                         : Native WebView2 offline rendering engines
- dist\                         : Pre-compiled Perplexity AI dark-mode interface
- demo\                         : Synthetic datasets, inspection reports, meeting notes
- models\                       : Local open-weight models directory
- public\                       : Icons and media assets

======================================================================
"@

Set-Content -Path "$DestinationPath\README.txt" -Value $readmeContent -Encoding UTF8

Write-Host "Packaging complete!"
Get-ChildItem -Path $DestinationPath | Select-Object Name, Mode, Length
