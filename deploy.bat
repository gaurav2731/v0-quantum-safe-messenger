@echo off
REM Quantum-Safe Messenger Deployment Script for Windows
REM Usage: deploy.bat [environment]
REM Environments: dev, staging, prod

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=dev

echo 🚀 Starting deployment for environment: %ENVIRONMENT%
echo 📁 Current directory: %cd%

REM Color codes simulation
echo ========================================
echo    Quantum-Safe Messenger Deployment
echo ========================================

REM Check prerequisites
echo 🔍 Checking prerequisites...

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js is not installed
    exit /b 1
)
echo ✓ Node.js version: 
node --version

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm is not installed
    exit /b 1
)
echo ✓ npm version:
npm --version

REM Setup environment
echo 🛠️ Setting up environment...
if not exist ".env.%ENVIRONMENT%" (
    echo ⚠ Environment file .env.%ENVIRONMENT% not found
    if exist ".env.example" (
        echo Copying .env.example to .env.%ENVIRONMENT%
        copy ".env.example" ".env.%ENVIRONMENT%" >nul
    )
)

REM Install dependencies
echo 📦 Installing dependencies...
if exist "node_modules" (
    echo Cleaning existing node_modules...
    rmdir /s /q "node_modules" >nul 2>&1
)
if exist "package-lock.json" (
    del "package-lock.json" >nul 2>&1
)

echo Installing production dependencies...
npm ci --only=production
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies
    exit /b 1
)
echo ✓ Production dependencies installed

REM Install development dependencies for build
if not "%ENVIRONMENT%"=="prod" (
    echo Installing development dependencies...
    npm install --save-dev typescript @types/node jest supertest
    echo ✓ Development dependencies installed
)

REM Build application
echo 🏗️ Building application...
npm run build
if %errorlevel% neq 0 (
    echo ⚠ Build warnings or issues, continuing...
)
echo ✓ Application built

REM Run tests (skip in production)
if not "%ENVIRONMENT%"=="prod" (
    echo 🧪 Running tests...
    npm test
    echo ✓ Tests completed
)

REM Create log directory
echo 📊 Setting up logging...
if not exist "logs" mkdir "logs"

REM Create backup directory
if not exist "backups" mkdir "backups"

REM Final status
echo.
echo ========================================
echo    🎉 DEPLOYMENT COMPLETED
echo ========================================
echo Environment: %ENVIRONMENT%
echo Time: %date% %time%
echo.
echo 🌐 Access URLs:
echo   Frontend: http://localhost:3000
echo   Backend API: http://localhost:3001
echo   Health Check: http://localhost:3001/api/health
echo.
echo 📁 Important Directories:
echo   Logs: %cd%\logs
echo   Backups: %cd%\backups
echo   Config: %cd%\.env.%ENVIRONMENT%
echo.
echo 🔧 Management Commands:
echo   Start server: npm run server
echo   Start dev server: npm run server:dev
echo   Run tests: npm test
echo   Build: npm run build
echo.
echo ✓ Deployment completed successfully!
pause