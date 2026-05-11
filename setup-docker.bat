@echo off
REM Faculty Website Docker Setup Script for Windows
REM This script helps set up Docker and Docker Compose for the Faculty Website

setlocal enabledelayedexpansion

REM Colors are not directly supported in batch, but we'll use simple markers
cls
echo.
echo ====================================
echo   Faculty Website Docker Setup
echo ====================================
echo.

REM Check Docker installation
echo Checking Docker Installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed
    echo Please install Docker Compose
    pause
    exit /b 1
)

echo [OK] Docker is installed
for /f "tokens=*" %%i in ('docker --version') do echo     %%i
for /f "tokens=*" %%i in ('docker-compose --version') do echo     %%i

REM Create required directories
echo.
echo Setting up Directory Structure...

if not exist "nginx\ssl" (
    mkdir nginx\ssl
    echo [OK] Created nginx\ssl directory
)

if not exist "backend\data" (
    mkdir backend\data
    echo [OK] Created backend\data directory
)

REM Check SSL certificates
echo.
echo Checking SSL Certificates...

if not exist "nginx\ssl\nginx-SSL2025-26.pem" (
    echo [WARNING] SSL certificate not found: nginx\ssl\nginx-SSL2025-26.pem
    echo Please copy your SSL certificate to nginx\ssl\
)

if not exist "nginx\ssl\star_iitdh_key.key" (
    echo [WARNING] SSL key not found: nginx\ssl\star_iitdh_key.key
    echo Please copy your SSL key to nginx\ssl\
)

if exist "nginx\ssl\nginx-SSL2025-26.pem" (
    if exist "nginx\ssl\star_iitdh_key.key" (
        echo [OK] SSL certificates found
    )
)

REM Build images
echo.
echo Building Docker Images...
echo This may take several minutes on first run...
echo.
docker-compose build

if errorlevel 1 (
    echo [ERROR] Failed to build Docker images
    pause
    exit /b 1
)

echo [OK] Docker images built successfully

REM Start services
echo.
set /p start="Start services now? (y/n): "
if /i "%start%"=="y" (
    echo.
    echo Starting Services...
    docker-compose up -d
    
    if errorlevel 1 (
        echo [ERROR] Failed to start services
        pause
        exit /b 1
    )
    
    echo [OK] Services started
    
    echo.
    echo Waiting for services to be ready (10 seconds)...
    timeout /t 10 /nobreak
    
    echo.
    echo Service Status:
    docker-compose ps
    
    echo.
    echo ====================================
    echo   Access Information
    echo ====================================
    echo Services are now running at:
    echo   Main Website: https://faculty.iitdh.ac.in
    echo   API: https://faculty.iitdh.ac.in/api
    echo   Admin Panel: https://faculty.iitdh.ac.in/admin
    echo.
    echo View logs with:
    echo   docker-compose logs -f
    echo.
    echo Stop services with:
    echo   docker-compose down
) else (
    echo To start services later, run: docker-compose up -d
)

echo.
pause
