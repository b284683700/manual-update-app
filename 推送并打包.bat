@echo off
chcp 65001 >nul
echo ========================================
echo   推送到GitHub并自动打包
echo ========================================
echo.

cd manual-update-app-rn

echo [1/4] 检查Git状态...
git status
echo.

echo [2/4] 添加所有文件...
git add .
echo ✅ 文件已添加

echo.
echo [3/4] 提交更改...
set /p commit_msg="请输入提交信息: "
if "%commit_msg%"=="" set commit_msg=feat: 更新手动上报APP

git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️ 没有需要提交的更改
) else (
    echo ✅ 提交完成
)

echo.
echo [4/4] 推送到GitHub...
git push origin main
if errorlevel 1 (
    echo ❌ 推送失败，尝试推送到master分支...
    git push origin master
)

echo.
echo ========================================
echo   ✅ 推送完成！
echo ========================================
echo.
echo 📦 GitHub Actions将自动开始打包APK
echo 📱 请访问GitHub仓库的Actions页面查看进度
echo 🕐 预计需要10-15分钟完成打包
echo.
echo 查看地址: https://github.com/你的用户名/你的仓库名/actions
echo.

pause
