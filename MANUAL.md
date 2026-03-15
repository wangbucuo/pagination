# Pagination.js 使用手册

## 目录

1. [概述](#概述)
2. [Pagination 类](#pagination-类)
3. [PicView 类](#picview-类)
4. [卡片扩展功能](#卡片扩展功能)
5. [完整示例](#完整示例)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

## 概述

Pagination.js 是一个轻量级的纯 JavaScript 分页库，提供图片卡片展示和管理功能。库包含两个核心类：

- **Pagination** - 分页控制器，负责页码计算和渲染
- **PicView** - 图片视图，负责卡片展示和交互

### 数据结构

```javascript
{
    picName: '图片名称',      // 必需：图片名称
    picUrl: '图片URL',         // 必需：图片地址
    id: 'custom-card-1',      // 可选：卡片ID，用于标识特定卡片
    // 可以添加自定义字段，用于样式匹配
    category: 'special',       // 可选：自定义数据
    tag: 'featured'            // 可选：自定义数据
}
```

---

## Pagination 类

### 构造函数

```javascript
const pagination = new Pagination({
    totalItems: 100,           // 必需：总项目数
    itemsPerPage: 9,           // 可选：每页显示项目数，默认 9
    currentPage: 1,            // 可选：当前页码，默认 1
    maxVisiblePages: 5,         // 可选：最多显示页码数，默认 5
    onPageChange: (page) => {} // 可选：页码变化回调函数
});
```

**说明：**
- `totalItems` - 总项目数，自动计算总页数
- `itemsPerPage` - 每页显示的项目数
- `currentPage` - 初始页码，会自动限制在有效范围内
- `maxVisiblePages` - 控制分页按钮显示数量，当页码较多时会显示省略号
- `onPageChange` - 页码切换时回调，接收当前页码参数

### 方法

#### render(container)

渲染分页控件到指定容器。

```javascript
pagination.render('#pagination-container');
```

#### setPage(page)

设置当前页码。

```javascript
pagination.setPage(2);
```

#### getCurrentPage()

获取当前页码。

```javascript
const currentPage = pagination.getCurrentPage();
```

#### getTotalPages()

获取总页数。

```javascript
const totalPages = pagination.getTotalPages();
```

#### update(options)

动态更新分页配置。

```javascript
pagination.update({
    totalItems: newCount,
    itemsPerPage: 12,
    currentPage: 1
});
```

#### setPicView(picView)

关联 PicView 实例。

```javascript
pagination.setPicView(picView);
```

---

## PicView 类

### 构造函数

```javascript
const picView = new PicView({
    container: '#picView',      // 必需：容器选择器或元素
    dataJson: data,              // 必需：数据数组
    picWith: 290,                // 可选：图片宽度，默认 290
    picHeight: 200,              // 可选：图片高度，默认 200
    rows: 3,                     // 可选：列数，默认 3
    onDeleted: (picName) => {},  // 可选：删除回调函数
    cardStyle: {...},            // 可选：卡片样式配置
    cardEvents: {...}            // 可选：卡片事件配置
});
```

### 方法

#### render()

渲染图片卡片。

```javascript
picView.render();
```

#### setPagination(pagination)

关联 Pagination 实例。

```javascript
picView.setPagination(pagination);
```

---

## 卡片扩展功能

### 1. 卡片ID配置

在数据对象中添加可选的 `id` 字段，为卡片设置自定义ID。

```javascript
const data = [
    { picName: '图片1', picUrl: 'image1.jpg', id: 'custom-card-1' },
    { picName: '图片2', picUrl: 'image2.jpg', id: 'custom-card-2' }
];
```

**说明：**
- 如果配置了 `id` 字段且值为有效值，卡片的DOM元素 `id` 属性将设置为该值
- 如果未配置 `id` 或值为空（null、undefined、空字符串），则不设置 `id` 属性
- 支持将数字等类型自动转换为字符串

### 2. 卡片样式自定义（cardStyle）

为特定卡片应用自定义 CSS 样式，支持两种匹配方式。

#### 基于索引

```javascript
cardStyle: {
    index: 0,
    style: {
        border: '3px solid red',
        borderRadius: '10px'
    }
}
```

#### 基于匹配函数

```javascript
cardStyle: {
    match: (data, index) => {
        return data.category === 'special';
    },
    style: {
        backgroundColor: '#f0f0f0'
    }
}
```

#### 样式数组

```javascript
cardStyle: [
    { index: 0, style: { border: '3px solid red' } },
    { match: (data, index) => index % 2 === 0, style: { backgroundColor: '#e6f7ff' } }
]
```

### 3. 卡片事件绑定（cardEvents）

为卡片绑定自定义事件处理器。

```javascript
cardEvents: {
    match: (data, index) => index >= 5,
    events: {
        click: (data, index, event) => {
            console.log('点击了卡片', data);
        },
        dblclick: (data, index, event) => {
            window.open(data.picUrl, '_blank');
        }
    }
}
```

**重要说明：**
- 当配置了自定义 `click` 或 `dblclick` 事件时，原有的默认单击查看大图功能会自动禁用
- 取而代之的是在删除按钮左侧会出现一个"放大"按钮，点击该按钮可以查看大图
- 这种设计避免了事件冲突，同时保留了查看大图的功能
- 支持所有标准 DOM 事件类型

---

## 完整示例

### 基础示例

```javascript
const data = [
    { picName: '图片1', picUrl: 'image1.jpg' },
    { picName: '图片2', picUrl: 'image2.jpg' }
];

const pagination = new Pagination({
    totalItems: data.length,
    itemsPerPage: 9,
    currentPage: 1
});

const picView = new PicView({
    container: '#picView',
    dataJson: data,
    picWith: 290,
    picHeight: 200,
    columns: 3,
    onDeleted: (picName) => console.log('删除:', picName)
});

pagination.setPicView(picView);
pagination.render('#pagination');
```

### 高级示例（带扩展功能）

```javascript
const data = Array.from({ length: 30 }, (_, i) => ({
    picName: `图片 ${i + 1}`,
    picUrl: `https://via.placeholder.com/290x200?text=${i + 1}`,
    category: i % 5 === 0 ? 'special' : 'normal'
}));

const pagination = new Pagination({
    totalItems: data.length,
    itemsPerPage: 9
});

const picView = new PicView({
    container: '#picView',
    dataJson: data,
    picWith: 290,
    picHeight: 200,
    columns: 3,
    cardStyle: [
        {
            index: 0,
            style: { border: '3px solid #52c41a', borderRadius: '10px' }
        },
        {
            match: (data, index) => data.category === 'special',
            style: { backgroundColor: '#fff7e6' }
        }
    ],
    cardEvents: [
        {
            match: (data, index) => index >= 5,
            events: {
                dblclick: (data, index, event) => {
                    window.open(data.picUrl, '_blank');
                }
            }
        }
    ]
});

pagination.setPicView(picView);
pagination.render('#pagination');
```

---

## 最佳实践

1. **数据结构规范** - 确保 dataJson 是数组，每个元素包含 picName 和 picUrl
2. **性能优化** - 对于大量数据，考虑分页加载
3. **样式冲突** - 使用 !important 或特定选择器避免样式被覆盖
4. **事件管理** - 避免重复绑定事件，必要时先移除旧事件
5. **响应式设计** - 根据屏幕尺寸动态调整 columns 参数

---

## 常见问题

**Q: 如何动态更新数据？**

A: 修改 picView.options.dataJson，然后调用 render() 和 pagination.update()

**Q: 如何自定义分页按钮样式？**

A: 通过 CSS 覆盖 .pagination-button 类样式

**Q: 支持哪些事件类型？**

A: 支持所有标准 DOM 事件，如 click, dblclick, mouseenter, mouseleave 等

**Q: 样式和事件的优先级？**

A: 后定义的规则会覆盖先定义的相同属性

**Q: 配置 cardEvents 后，原来的点击查看大图功能呢？**

A: 配置 cardEvents 后，原来的图片点击查看大图功能会自动禁用，取而代之的是在删除按钮左侧会出现一个"放大"按钮，点击该按钮可以查看大图。这样可以避免事件冲突，同时保留查看大图的功能。

**Q: 如何修改放大按钮的样式？**

A: 可以通过 CSS 覆盖 `.pic-view-detail .overlay .pic-view-detail-btn.zoom-btn` 类样式
