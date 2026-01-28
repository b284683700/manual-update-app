@echo off
chcp 65001 >nul
echo ========================================
echo   手动上报APP - 快速开始
echo ========================================
echo.

cd manual-update-app-rn

echo [1/3] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装Node.js，请先安装Node.js 18+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js已安装

echo.
echo [2/3] 安装依赖...
call npm install
if errorlevel 1 (
    echo ❌ 安装依赖失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

echo.
echo [3/3] 启动开发服务器...
echo.
echo 📱 请在手机上安装Expo Go APP
echo 📱 然后扫描二维码即可预览
echo.
call npm start

pause
