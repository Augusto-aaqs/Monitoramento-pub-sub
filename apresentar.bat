@echo off
REM ==========================================================
REM  apresentar.bat - roda a simulacao Pub/Sub com 2 cliques
REM  Aperte ENTER para avancar cada etapa.
REM ==========================================================
chcp 65001 > nul
cd /d "%~dp0"
cls
node src\main.js
echo.
pause
