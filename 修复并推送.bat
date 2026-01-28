@echo off
chcp 65001 >nul
echo ========================================
echo   修复 Android 打包错误并推送到 GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 检查 Git 状态...
git status
echo.

echo [2/4] 添加修改的文件...
git add .github/workflows/build.yml
git add Android打包错误修复说明.md
echo ✓ 文件已添加
echo.

echo [3/4] 提交修改...
git commit -m "修复 Android 打包时的 build.gradle 语法错误

- 将 sed 命令替换为 Python 脚本来修改 build.gradle
- 使用正则表达式精确匹配和替换配置
- 确保 signingConfigs 和 buildTypes 的语法结构正确
- 添加详细的修复说明文档"
echo ✓ 提交完成
echo.

echo [4/4] 推送到 GitHub...
git push
echo.

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo   ✓ 修复已成功推送到 GitHub
    echo ========================================
    echo.
    echo 下一步：
    echo 1. 访问 GitHub 仓库的 Actions 页面
    echo 2. 查看自动触发的构建任务
    echo 3. 确认构建成功完成
    echo.
) else (
    echo ========================================
    echo   ✗ 推送失败，请检查错误信息
    echo ========================================
    echo.
)

pause
