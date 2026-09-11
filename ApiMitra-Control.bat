@echo off
title ApiMitra Control Panel
color 0B

:MENU
cls
echo.
echo  =============================================
echo         ApiMitra Control Panel
echo  =============================================
echo.
echo   [1] Start Both (Backend + Frontend)
echo   [2] Stop Both
echo   [3] Restart Both
echo   [4] Start Backend Only
echo   [5] Start Frontend Only
echo   [6] Stop Backend Only
echo   [7] Stop Frontend Only
echo   [8] Check Status
echo   [9] Open in Browser
echo   [0] Exit
echo.
echo  =============================================
set /p choice= Enter choice: 

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto STOP_ALL
if "%choice%"=="3" goto RESTART_ALL
if "%choice%"=="4" goto START_BACKEND
if "%choice%"=="5" goto START_FRONTEND
if "%choice%"=="6" goto STOP_BACKEND
if "%choice%"=="7" goto STOP_FRONTEND
if "%choice%"=="8" goto STATUS
if "%choice%"=="9" goto OPEN_BROWSER
if "%choice%"=="0" goto EXIT
goto MENU

:START_ALL
echo.
echo  Starting Backend...
start "ApiMitra-Backend" cmd /k "cd /d "%~dp0backend" && node src/index.js"
timeout /t 3 >nul
echo  Starting Frontend...
start "ApiMitra-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo  Both services started!
echo  Backend  : http://localhost:5000
echo  Frontend : http://localhost:5173
echo.
pause
goto MENU

:STOP_ALL
echo.
echo  Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo  Done. All services stopped.
echo.
pause
goto MENU

:RESTART_ALL
echo.
echo  Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo  Starting Backend...
start "ApiMitra-Backend" cmd /k "cd /d "%~dp0backend" && node src/index.js"
timeout /t 3 >nul
echo  Starting Frontend...
start "ApiMitra-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo.
echo  Both services restarted!
echo.
pause
goto MENU

:START_BACKEND
echo.
echo  Starting Backend...
start "ApiMitra-Backend" cmd /k "cd /d "%~dp0backend" && node src/index.js"
echo  Backend started at http://localhost:5000
echo.
pause
goto MENU

:START_FRONTEND
echo.
echo  Starting Frontend...
start "ApiMitra-Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo  Frontend started at http://localhost:5173
echo.
pause
goto MENU

:STOP_BACKEND
echo.
echo  Stopping backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo  Backend stopped.
echo.
pause
goto MENU

:STOP_FRONTEND
echo.
echo  Stopping frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo  Frontend stopped.
echo.
pause
goto MENU

:STATUS
echo.
echo  Checking service status...
echo.
netstat -ano | findstr ":5000 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo  [ON]  Backend   : http://localhost:5000  (RUNNING)
) else (
    echo  [OFF] Backend   : http://localhost:5000  (STOPPED)
)
netstat -ano | findstr ":5173 " | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    echo  [ON]  Frontend  : http://localhost:5173  (RUNNING)
) else (
    echo  [OFF] Frontend  : http://localhost:5173  (STOPPED)
)
echo.
pause
goto MENU

:OPEN_BROWSER
start http://localhost:5173
goto MENU

:EXIT
exit
