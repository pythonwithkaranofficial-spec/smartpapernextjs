@echo off
setlocal
echo =======================================================
echo Building Smart Paper AI Debug APK for Android Testing
echo =======================================================

cd /d "%~dp0..\android"
call gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo [SUCCESS] Debug APK built successfully!
    echo Output APK location:
    echo %~dp0..\android\app\build\outputs\apk\debug\app-debug.apk
    echo =======================================================
) else (
    echo [ERROR] Build failed. Review gradle logs above.
)
pause
