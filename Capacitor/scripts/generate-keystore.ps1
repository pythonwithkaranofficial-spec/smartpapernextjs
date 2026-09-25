# Smart Paper Generator AI - Keystore Generator (PowerShell)
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$keystorePath = Join-Path $scriptDir "..\android\release.keystore"
$propsPath = Join-Path $scriptDir "..\android\keystore.properties"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Smart Paper Generator AI - Production Keystore Generator" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

if (Test-Path $keystorePath) {
    Write-Host "[INFO] Keystore already exists at: $keystorePath" -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Creating new release keystore..." -ForegroundColor Green
    & keytool -genkey -v -keystore $keystorePath -alias smartpaper -keyalg RSA -keysize 2048 -validity 10000 -storepass SmartPaper2026! -keypass SmartPaper2026! -dname "CN=Smart Paper Generator, OU=Mobile, O=SmartPaper, L=Delhi, S=Delhi, C=IN"
    Write-Host "[SUCCESS] Keystore created successfully." -ForegroundColor Green
}

$propsContent = @"
storeFile=../release.keystore
storePassword=SmartPaper2026!
keyAlias=smartpaper
keyPassword=SmartPaper2026!
"@

Set-Content -Path $propsPath -Value $propsContent -Encoding Ascii
Write-Host "[SUCCESS] keystore.properties configured!" -ForegroundColor Green
Write-Host "Keystore: $keystorePath"
Write-Host "Properties: $propsPath"
