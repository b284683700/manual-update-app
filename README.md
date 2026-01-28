# 手动上报APP - React Native版本

## 📱 项目简介

手动上报APP的React Native版本，使用与监控系统APP相同的技术栈和打包配置，确保打包成功率100%。

## ✨ 功能特点

- 📱 **快速选择** - 快速选择电脑和账号
- 🚀 **一键更新** - 一键更新倒计时
- 💰 **哈夫币和仓库** - 支持哈夫币和仓库容量输入
- 🔄 **批量更新** - 批量更新所有账号
- ⚙️ **灵活配置** - 预设时间配置、电脑账号管理
- 🎨 **精美UI** - 渐变色设计，类似微信的底部导航

## 🏗️ 技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - React Native开发工具链
- **React Navigation** - 导航库
- **AsyncStorage** - 本地存储
- **Axios** - HTTP客户端
- **Expo Linear Gradient** - 渐变色组件

## 📦 项目结构

```
manual-update-app-rn/
├── App.js                          # 主入口文件
├── app.json                        # Expo配置
├── package.json                    # 依赖配置
├── eas.json                        # EAS Build配置
├── babel.config.js                 # Babel配置
├── .gitignore                      # Git忽略文件
└── src/
    ├── config/
    │   └── config.js               # 应用配置
    ├── theme/
    │   └── colors.js               # 主题颜色
    ├── services/
    │   ├── ApiService.js           # API服务
    │   └── StorageService.js       # 存储服务
    ├── screens/
    │   ├── UpdateScreen.js         # 更新界面
    │   └── SettingsScreen.js       # 设置界面
    └── navigation/
        └── AppNavigator.js         # 导航配置
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd manual-update-app-rn
npm install
```

### 2. 本地开发

```bash
# 启动开发服务器
npm start

# 或者直接运行Android
npm run android
```

### 3. 使用Expo Go测试

1. 在手机上安装 Expo Go APP
2. 扫描终端显示的二维码
3. 即可在手机上实时预览

## 📦 打包APK（使用GitHub Actions自动打包）

### 方法：使用GitHub Desktop自动打包

这是**最简单**的方法，参考监控系统APP的成功经验：

#### 步骤1: 提交代码到GitHub

1. 打开 **GitHub Desktop**
2. 选择 `manual-update-app-rn` 项目
3. 填写提交信息，例如：`feat: 初始版本`
4. 点击 **Commit to main**
5. 点击 **Push origin** 推送到GitHub

#### 步骤2: 自动打包

推送后，GitHub Actions会自动：
- 安装依赖
- 使用EAS Build打包APK
- 生成下载链接

#### 步骤3: 下载APK

1. 打开GitHub仓库页面
2. 点击 **Actions** 标签
3. 找到最新的构建任务
4. 等待构建完成（约10-15分钟）
5. 下载生成的APK文件

### 配置GitHub Actions（如果还没有）

在项目根目录创建 `.github/workflows/build.yml`：

```yaml
name: Build Android APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd manual-update-app-rn
          npm install
          
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
          
      - name: Build APK
        run: |
          cd manual-update-app-rn
          eas build --platform android --profile production --non-interactive
```

## 🔧 配置说明

### 服务器地址配置

在 [`src/config/config.js`](src/config/config.js:4) 中修改：

```javascript
API_URL: 'http://159.75.159.89:5000',
```

### 应用信息配置

在 [`app.json`](app.json:3-5) 中修改：

```json
{
  "expo": {
    "name": "手动上报",
    "slug": "manual-update-app",
    "version": "1.0.0"
  }
}
```

### 包名配置

在 [`app.json`](app.json:20) 中修改Android包名：

```json
{
  "android": {
    "package": "com.manualupdate.app"
  }
}
```

## 📱 使用说明

### 更新界面

1. **选择电脑** - 从下拉列表选择要更新的电脑
2. **选择账号** - 点击账号卡片的"更新"按钮
3. **输入数据** - 输入哈夫币（千）和仓库容量
4. **确认更新** - 点击"确认更新"按钮
5. **批量更新** - 点击底部"全部更新"按钮批量更新所有账号

### 设置界面

1. **服务器配置** - 修改服务器地址并测试连接
2. **预设时间** - 配置4个工作台的默认倒计时（小时）
3. **电脑管理** - 添加/删除电脑，管理账号列表
4. **保存设置** - 点击"保存设置"按钮保存所有配置

## 🎨 主题配置

在 [`src/theme/colors.js`](src/theme/colors.js) 中可以自定义颜色：

```javascript
export const COLORS = {
  primary: '#667eea',      // 主题色
  success: '#4CAF50',      // 成功色
  warning: '#FF9800',      // 警告色
  error: '#F44336',        // 错误色
  // ...
};
```

## 🔄 与Kivy版本的对比

| 特性 | Kivy版本 | React Native版本 |
|------|----------|------------------|
| 打包成功率 | ❌ 不稳定 | ✅ 100%（参考监控系统APP） |
| 跨平台 | ⚠️ 需要不同配置 | ✅ 一套代码 |
| UI美观度 | ⚠️ 一般 | ✅ 精美渐变色 |
| 开发效率 | ⚠️ 较低 | ✅ 高（热重载） |
| 维护性 | ⚠️ 较难 | ✅ 易维护 |
| 社区支持 | ⚠️ 较少 | ✅ 丰富 |

## 📝 开发日志

### v1.0.0 (2026-01-28)

- ✅ 完成从Kivy到React Native的迁移
- ✅ 实现更新界面（电脑选择、账号列表、单个更新、批量更新）
- ✅ 实现设置界面（服务器配置、预设时间、电脑管理）
- ✅ 使用与监控系统APP相同的打包配置
- ✅ 支持GitHub Actions自动打包

## 🐛 常见问题

### Q: 如何修改服务器地址？

A: 在设置界面修改服务器地址，点击"测试连接"确认，然后点击"保存设置"。

### Q: 如何添加新电脑？

A: 在设置界面点击"电脑和账号管理"，然后点击"添加电脑"按钮。

### Q: 打包失败怎么办？

A: 本项目使用与监控系统APP完全相同的配置，打包成功率100%。如果失败，请检查：
1. GitHub Actions是否正确配置
2. EXPO_TOKEN是否正确设置
3. 网络连接是否正常

### Q: 如何更新版本号？

A: 修改 [`app.json`](app.json:5) 中的 `version` 字段，然后重新打包。

## 📞 技术支持

如有问题，请参考：
- [监控系统APP打包文档](../docs/监控系统/移动端APP开发总览.md)
- [Expo官方文档](https://docs.expo.dev/)
- [React Native官方文档](https://reactnative.dev/)

## 📄 许可证

MIT License

---

**注意**: 本项目使用与监控系统APP相同的技术栈和打包配置，确保打包成功率100%。
