@echo off
echo ======================================================================
echo  DEPLOY HUMAN BI EXECUTIVE DASHBOARD TO GITHUB PAGES
echo  Alwinson Bustamante - Faculty & Military Analytics for Ma'am Jane
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Git repository...
if not exist ".git" (
    echo Initializing new Git repository...
    git init
    git branch -M main
)

echo [2/4] Staging files...
git add index.html data assets README.md DEPLOY_GITHUB_PAGES.md deploy.bat

echo [3/4] Creating commit...
git commit -m "Deploy: Human BI Executive Dashboard for Ma'am Jane"

echo.
echo [4/4] Next Steps:
echo If you haven't linked your GitHub repository yet, run:
echo    git remote add origin https://github.com/YOUR_USERNAME/human-bi-dashboard.git
echo    git push -u origin main
echo.
echo Then enable GitHub Pages under Repository Settings -> Pages -> Deploy from branch 'main'!
echo ======================================================================
pause
