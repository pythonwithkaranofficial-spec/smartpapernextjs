@echo off
setlocal
echo =======================================================
echo Building Smart Paper AI Production AAB for Play Store
echo =======================================================

rem Ensure keystore exists
if not exist "%~dp0..\android\release.keystore" (
    echo [INFO] Keystore missing. Generating release keystore first...
    call "%~dp0generate-keystore.bat"
)

cd /d "%~dp0..\android"
call gradlew.bat bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo [SUCCESS] Release AAB built successfully!
    echo Upload this AAB to Google Play Console:
    echo %~dp0..\android\app\build\outputs\bundle\release\app-release.aab
    echo =======================================================
) else (
    echo [ERROR] Release AAB bundle build failed.
)
pause
