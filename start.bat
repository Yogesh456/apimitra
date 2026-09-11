@echo off
echo Starting ApiMitra...
start "ApiMitra Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 >nul
start "ApiMitra Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo Admin login: admin@apimitra.com / Admin@123
