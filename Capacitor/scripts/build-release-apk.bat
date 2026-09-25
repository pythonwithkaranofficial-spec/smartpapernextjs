@echo off
setlocal
echo =======================================================
echo Building Smart Paper AI Signed Release APK
echo =======================================================

rem Ensure keystore exists
if not exist "%~dp0..\android\release.keystore" (
    echo [INFO] Keystore missing. Generating release keystore first...
    call "%~dp0generate-keystore.bat"
)

cd /d "%~dp0..\android"
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo [SUCCESS] Release APK built successfully!
    echo Output APK location:
    echo %~dp0..\android\app\build\outputs\apk\release\app-release.apk
    echo =======================================================
) else (
    echo [ERROR] Release APK build failed.
)
pause
