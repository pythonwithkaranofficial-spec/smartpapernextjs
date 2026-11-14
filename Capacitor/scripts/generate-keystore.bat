@echo off
setlocal DisableDelayedExpansion
echo =======================================================
echo Smart Paper Generator AI - Keystore Generator
echo =======================================================

set "KEYSTORE_FILE=%~dp0..\android\release.keystore"
set "PROPERTIES_FILE=%~dp0..\android\keystore.properties"

rem Password source: env var SMARTPAPER_KEYSTORE_PASSWORD, otherwise prompt.
rem Note: the double-quote character (") is not supported in the password.
set "KS_PASS=%SMARTPAPER_KEYSTORE_PASSWORD%"
if defined KS_PASS goto have_password

echo Enter the keystore password (min 6 characters). It will be visible while typing;
echo set SMARTPAPER_KEYSTORE_PASSWORD or use generate-keystore.ps1 to avoid that.
set /p "KS_PASS=Keystore password: "
set /p "KS_PASS2=Confirm password: "
setlocal EnableDelayedExpansion
if not "!KS_PASS!"=="!KS_PASS2!" (
    echo [ERROR] Passwords do not match.
    pause
    exit /b 1
)
endlocal

:have_password
setlocal EnableDelayedExpansion
if not defined KS_PASS (
    echo [ERROR] No password provided.
    pause
    exit /b 1
)
set "KS_CHECK=!KS_PASS:~5,1!"
if not defined KS_CHECK (
    echo [ERROR] Password must be at least 6 characters.
    pause
    exit /b 1
)

if exist "!KEYSTORE_FILE!" (
    echo [INFO] Keystore already exists at: !KEYSTORE_FILE!
    echo [INFO] The password you entered must be the existing keystore's password.
    goto create_properties
)

echo [INFO] Creating new release keystore...
keytool -genkey -v -keystore "!KEYSTORE_FILE!" -alias smartpaper -keyalg RSA -keysize 2048 -validity 10000 -storepass "!KS_PASS!" -keypass "!KS_PASS!" -dname "CN=Smart Paper Generator, OU=Mobile, O=SmartPaper, L=Delhi, S=Delhi, C=IN"

if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Failed to generate keystore. Make sure Java / JDK is in PATH.
    pause
    exit /b 1
)

:create_properties
echo [INFO] Writing keystore.properties ^(gitignored - never commit it^)...
> "!PROPERTIES_FILE!" echo storeFile=../release.keystore
>> "!PROPERTIES_FILE!" echo storePassword=!KS_PASS!
>> "!PROPERTIES_FILE!" echo keyAlias=smartpaper
>> "!PROPERTIES_FILE!" echo keyPassword=!KS_PASS!

echo =======================================================
echo [SUCCESS] Keystore and keystore.properties generated!
echo Path: !KEYSTORE_FILE!
echo Properties: !PROPERTIES_FILE!
echo Back up release.keystore and its password securely.
echo =======================================================
endlocal
pause
