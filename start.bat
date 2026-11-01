@echo off
title Website Reaper - High-Fidelity Website Cloner
echo ========================================================
echo   Starting Website Reaper...
echo ========================================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required to run Website Reaper.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js detected.
echo Launching server at http://localhost:5050 ...
start http://localhost:5050
node server.js
pause

