# Smart Paper Generator AI - Keystore Generator (PowerShell)
# Password source: $env:SMARTPAPER_KEYSTORE_PASSWORD, otherwise prompted (hidden input).
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$keystorePath = Join-Path $scriptDir "..\android\release.keystore"
$propsPath = Join-Path $scriptDir "..\android\keystore.properties"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Smart Paper Generator AI - Production Keystore Generator" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

function ConvertTo-PlainText([System.Security.SecureString]$secure) {
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

$password = $env:SMARTPAPER_KEYSTORE_PASSWORD
if ([string]::IsNullOrEmpty($password)) {
    $first = ConvertTo-PlainText (Read-Host -AsSecureString "Keystore password (min 6 characters)")
    $second = ConvertTo-PlainText (Read-Host -AsSecureString "Confirm password")
    if ($first -ne $second) {
        Write-Host "[ERROR] Passwords do not match." -ForegroundColor Red
        exit 1
    }
    $password = $first
}

if ($password.Length -lt 6) {
    Write-Host "[ERROR] Password must be at least 6 characters." -ForegroundColor Red
    exit 1
}

if (Test-Path $keystorePath) {
    Write-Host "[INFO] Keystore already exists at: $keystorePath" -ForegroundColor Yellow
    Write-Host "[INFO] The password you entered must be the existing keystore's password." -ForegroundColor Yellow
} else {
    Write-Host "[INFO] Creating new release keystore..." -ForegroundColor Green
    & keytool -genkey -v -keystore $keystorePath -alias smartpaper -keyalg RSA -keysize 2048 -validity 10000 -storepass $password -keypass $password -dname "CN=Smart Paper Generator, OU=Mobile, O=SmartPaper, L=Delhi, S=Delhi, C=IN"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to generate keystore. Make sure Java / JDK is in PATH." -ForegroundColor Red
        exit 1
    }
    Write-Host "[SUCCESS] Keystore created successfully." -ForegroundColor Green
}

# java.util.Properties treats backslash as an escape character
$escaped = $password.Replace('\', '\')
$propsContent = @"
storeFile=../release.keystore
storePassword=$escaped
keyAlias=smartpaper
keyPassword=$escaped
"@

Set-Content -Path $propsPath -Value $propsContent -Encoding Ascii
$password = $null; $escaped = $null
Write-Host "[SUCCESS] keystore.properties configured (gitignored - never commit it)." -ForegroundColor Green
Write-Host "Keystore: $keystorePath"
Write-Host "Properties: $propsPath"
Write-Host "Back up release.keystore and its password securely." -ForegroundColor Yellow
