# Pagination.js - 纯 JavaScript 分页图片库

一个轻量级、零依赖的纯 JavaScript 分页库，专注于图片卡片展示和管理。

## 功能特点

### 核心功能
- **智能分页** - 自动计算页码，支持首尾页码显示和省略号
- **图片卡片展示** - 响应式网格布局，自适应图片展示
- **交互操作** - 点击图片全屏查看、悬停删除
- **动态更新** - 支持实时添加/删除数据，自动刷新分页

### 扩展功能 ✨
- **卡片ID配置** - 支持在数据对象中配置自定义卡片ID
- **卡片样式自定义** - 为特定卡片应用自定义 CSS 样式
- **卡片事件绑定** - 支持为卡片绑定单击、双击等自定义事件处理器
- **灵活匹配** - 支持基于索引或数据匹配函数
- **向后兼容** - 完全兼容原有 API，现有代码无需修改

## 快速开始

### 基础使用

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Pagination.js 示例</title>
</head>
<body>
    <div id="picView"></div>
    <div id="pagination"></div>

    <script src="pagination.js"></script>
    <script>
        // 准备数据
        const data = [
            { picName: '图片1', picUrl: 'image1.jpg' },
            { picName: '图片2', picUrl: 'image2.jpg' },
            // ... 更多数据
        ];

        // 创建分页实例
        const pagination = new Pagination({
            totalItems: data.length,
            itemsPerPage: 9,
            currentPage: 1,
            onPageChange: (page) => console.log('切换到第', page, '页')
        });

        // 创建图片视图实例
        const picView = new PicView({
            container: '#picView',
            dataJson: data,
            picWith: 290,
            picHeight: 200,
            columns: 3,
            onDeleted: (picName) => {
                console.log('已删除:', picName);
            }
        });

        // 关联分页和视图
        pagination.setPicView(picView);
        pagination.render('#pagination');
    </script>
</body>
</html>
```

## 安装

### 方式一：直接引入

```html
<script src="pagination.js"></script>
```

## 新功能说明

### 1. 卡片ID配置

支持在数据对象中添加可选的 `id` 字段，为卡片设置自定义标识：

```javascript
const data = [
    { picName: '图片1', picUrl: 'image1.jpg', id: 'custom-card-1' },
    { picName: '图片2', picUrl: 'image2.jpg' }  // 无ID，不设置卡片ID
];
```

### 2. 双击事件绑定

支持为卡片绑定双击事件处理器：

```javascript
cardEvents: {
    match: (data, index) => index >= 5,
    events: {
        dblclick: (data, index, event) => {
            window.open(data.picUrl, '_blank');
        }
    }
}
```

**注意**：当配置了自定义 `click` 或 `dblclick` 事件时，原有的默认单击查看大图功能会自动禁用，并在删除按钮左侧显示"放大"按钮。

### 方式二：ES Module

```javascript
import { Pagination, PicView } from './pagination.js';
```

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- iOS Safari 11+
- Android Chrome 60+

## 在线演示

查看 [示例页面](./example-card-extensibility.html) 了解完整功能演示。

## 文档

详细的使用文档请参考 [使用手册](./MANUAL.md)。

## 许可证

MIT License
