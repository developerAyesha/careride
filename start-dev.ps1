# CareRide Dev Startup Script
# Run this file from the project root: .\start-dev.ps1

Write-Host "Starting CareRide Backend (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\careride_back'; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting CareRide Frontend (port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\careride_frontend'; npm run serve"

Write-Host ""
Write-Host "Both servers starting in separate windows." -ForegroundColor Yellow
Write-Host "  Backend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
