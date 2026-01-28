# Android 打包错误修复说明

## 问题描述

在 GitHub Actions 自动打包时，出现以下错误：

```
FAILURE: Build failed with an exception.

* Where:
Build file '/home/runner/work/manual-update-app/manual-update-app/android/app/build.gradle' line: 120

* What went wrong:
Could not compile build file '/home/runner/work/manual-update-app/manual-update-app/android/app/build.gradle'.
> startup failed:
  build file '/home/runner/work/manual-update-app/manual-update-app/android/app/build.gradle': 120: Unexpected input: '{\n        debug {\n            signingConfig signingConfigs.debug\n        }\n        release {\n            signingConfig signingConfigs.release\n            minifyEnabled enableProguardInReleaseBuilds\n            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"\n        }\n    }\n}' @ line 120, column 1.
```

## 问题原因

在 `.github/workflows/build.yml` 文件的第 57-76 行，使用 `sed` 命令修改 `build.gradle` 文件时，由于正则表达式匹配和替换逻辑不当，导致生成了语法错误的 Gradle 配置文件。

具体问题：
1. `sed` 命令的替换逻辑可能导致 `buildTypes` 块的结构被破坏
2. 可能出现了多余的大括号或缺少必要的大括号
3. `sed` 在处理多行文本替换时容易出错

## 解决方案

已将原来的 `sed` 命令替换为更可靠的 Python 脚本来修改 `build.gradle` 文件。

### 修改内容

**原来的方法（有问题）：**
```yaml
- name: 📝 Modify build.gradle for signing
  run: |
    # 使用 sed 命令修改...
    sed -i '/android {/r /tmp/signing_config.txt' android/app/build.gradle
    sed -i '/release {/,/}/c\...' android/app/build.gradle
```

**新的方法（已修复）：**
```yaml
- name: 📝 Modify build.gradle for signing
  run: |
    # 使用 Python 脚本精确修改
    python3 << 'PYTHON_SCRIPT'
    import re
    
    # 1. 添加 signingConfigs
    # 2. 修改 buildTypes 中的 release 配置
    # 3. 确保 debug 配置存在
    ...
    PYTHON_SCRIPT
```

### Python 脚本的优势

1. **精确的文本处理**：使用正则表达式精确匹配和替换
2. **结构完整性**：确保 Gradle 配置的语法结构正确
3. **可读性强**：代码逻辑清晰，易于维护和调试
4. **错误处理**：可以添加更多的验证和错误处理逻辑

## 修改后的配置结构

修改后的 `build.gradle` 将包含：

```gradle
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

## 下一步操作

1. **提交修改**：
   ```bash
   cd manual-update-app-rn
   git add .github/workflows/build.yml
   git commit -m "修复 Android 打包时的 build.gradle 语法错误"
   git push
   ```

2. **触发构建**：
   - 推送代码后，GitHub Actions 会自动触发构建
   - 或者在 GitHub 仓库的 Actions 页面手动触发 workflow

3. **验证修复**：
   - 查看 GitHub Actions 的构建日志
   - 确认 "📝 Modify build.gradle for signing" 步骤成功执行
   - 确认 "🔨 Build APK" 步骤成功完成

## 调试技巧

如果仍然遇到问题，可以在 workflow 中添加调试步骤：

```yaml
- name: 🔍 Debug - Show build.gradle
  run: |
    echo "=== Complete build.gradle content ==="
    cat android/app/build.gradle
```

这样可以在构建日志中查看完整的 `build.gradle` 内容，帮助诊断问题。

## 相关文件

- `.github/workflows/build.yml` - GitHub Actions 工作流配置
- `android/app/build.gradle` - Android 应用构建配置（由 expo prebuild 生成）
- `打包指南.md` - 打包操作指南

## 技术说明

- **Expo Prebuild**：使用 `npx expo prebuild` 生成原生 Android 项目
- **Gradle 8.0.1**：Android 构建工具
- **Java 17**：构建所需的 Java 版本
- **Node.js 18**：React Native 开发环境
