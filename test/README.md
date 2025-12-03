# WebGL 深度附件测试

这是一个在浏览器中运行的 WebGL 深度附件测试项目。

## 测试内容

该项目包含两个测试用例：

1. **测试 1: 没有深度附件**
   - 验证当没有配置深度附件时，深度测试应该被禁用
   - 后绘制的绿色三角形应该覆盖先绘制的红色三角形

2. **测试 2: 有深度附件**
   - 验证当配置了深度附件时，深度测试应该被启用
   - 前面的绿色三角形（z=-0.5）应该覆盖后面的红色三角形（z=0.5）

## 运行方式

### 方式 1: 使用 Vite 开发服务器（推荐）

在项目根目录运行：

```bash
cd test
npm run dev
```

或者从根目录运行：

```bash
npm run test:dev
```

然后在浏览器中打开：
- `http://localhost:3001` - 查看深度附件测试（使用封装的 WebGL API）
- `http://localhost:3001/native-webgl-readpixels.html` - 查看原生 WebGL readPixels 测试

### 方式 2: 构建后运行

```bash
cd test
npm run build
npm run preview
```

## 测试说明

- **红色三角形**：z=0.5，先绘制
- **绿色三角形**：z=-0.5，后绘制（更靠近相机）

测试会读取画布中心点的像素颜色来验证深度测试是否正确工作。

## 文件结构

- `index.html` - 测试页面
- `test.ts` - 测试逻辑
- `vite.config.js` - Vite 配置文件

