@echo off
REM Gradle wrapper script for Windows
REM This script runs Gradle via the system installation

setlocal

set APP_HOME=%~dp0

where gradle >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Gradle not found. Please install Gradle 8.5+ and ensure it's in your PATH.
  echo Download from: https://gradle.org/releases/
  exit /b 1
)

gradle %*
