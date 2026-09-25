@echo off
setlocal
echo =======================================================
echo Smart Paper Generator AI - Keystore Generator
echo =======================================================

set KEYSTORE_FILE=%~dp0..\android\release.keystore
set PROPERTIES_FILE=%~dp0..\android\keystore.properties

if exist "%KEYSTORE_FILE%" (
    echo [INFO] Keystore already exists at: %KEYSTORE_FILE%
    goto create_properties
)

echo [INFO] Creating new release keystore...
"keytool" -genkey -v -keystore "%KEYSTORE_FILE%" -alias smartpaper -keyalg RSA -keysize 2048 -validity 10000 -storepass SmartPaper2026! -keypass SmartPaper2026! -dname "CN=Smart Paper Generator, OU=Mobile, O=SmartPaper, L=Delhi, S=Delhi, C=IN"

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate keystore. Make sure Java / JDK is in PATH.
    pause
    exit /b 1
)

:create_properties
echo [INFO] Writing keystore.properties...
(
echo storeFile=../release.keystore
echo storePassword=SmartPaper2026!
echo keyAlias=smartpaper
echo keyPassword=SmartPaper2026!
) > "%PROPERTIES_FILE%"

echo =======================================================
echo [SUCCESS] Keystore and keystore.properties generated!
echo Path: %KEYSTORE_FILE%
echo Properties: %PROPERTIES_FILE%
echo =======================================================
pause
