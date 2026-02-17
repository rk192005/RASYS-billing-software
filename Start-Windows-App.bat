@echo off
cd /d "%~dp0"

echo Checking dependencies...

rem Check and install backend dependencies
if not exist "server\node_modules" (
    echo Installing Backend dependencies...
    cd server && call npm install && cd ..
)

rem Check and install frontend dependencies
if not exist "client\node_modules" (
    echo Installing Frontend dependencies...
    cd client && call npm install && cd ..
)

echo Starting Rasys Billing Server...
start "Rasys Backend" cmd /k "cd server && node index.js"

echo Starting Rasys Billing Client...
start "Rasys Frontend" cmd /k "cd client && npm run dev"

echo Rasys Billing is launching...
