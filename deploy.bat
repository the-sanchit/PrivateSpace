@echo off
echo =====================================
echo   PrivateSpace Deployment Script
echo =====================================
echo.

echo [1/4] Installing frontend dependencies...
cd safenote-frontend
npm install
if %errorlevel% neq 0 goto :error

echo.
echo [2/4] Building frontend...
npm run build
if %errorlevel% neq 0 goto :error

echo.
echo [3/4] Git commit and push...
cd ..
git add .
git commit -m "Deploy to production - PrivateSpace v1.0"
git push origin main
if %errorlevel% neq 0 goto :error

echo.
echo =====================================
echo   Build Successful!
echo =====================================
echo.
echo Next steps:
echo 1. Go to vercel.com and import your GitHub repo
echo 2. Set root directory to 'safenote-frontend'
echo 3. Deploy!
echo.
echo For backend:
echo 1. Go to render.com
echo 2. Create new Web Service
echo 3. Connect your GitHub repo
echo 4. Set root to '_safenote-project/safenote-project'
echo 5. Build: mvn clean package
echo 6. Start: java -jar target/safenote-project-0.0.1-SNAPSHOT.jar
echo.
pause
exit /b 0

:error
echo.
echo =====================================
echo   Build Failed!
echo =====================================
echo.
pause
exit /b 1