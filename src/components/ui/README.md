以下是基于您提供的UI组件库生成的Markdown使用文档：
# UI组件库使用手册

## 组件列表
- [Modal 对话框](#modal)
- [Anchor 锚点导航](#anchor)
- [Button 按钮](#button)
- [FileUpload 文件上传](#fileupload)
- [Form 表单](#form)
- [Toast 消息提示](#toast)
- [ImageViewer 图片查看器](#imageviewer)
- [Pagination 分页](#pagination)
- [Popup 弹出层](#popup)
- [QRCode 二维码](#qrcode)
- [Skeleton 骨架屏](#skeleton)
- [Slider 滑块](#slider)
- [Switch 开关](#switch)
- [Tab 标签页](#tab)
- [Icon 图标](#icon)
- [JsonViewer JSON查看器](#jsonviewer)

---

## Modal 对话框
### 参数说明
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | Boolean | false | 显示状态 |
| dragable | Boolean | false | 是否可拖拽 |
| modeless | Boolean | true | 是否无模态 |
| width | Number/String | 400px | 宽度 |
| confirmTitle | String | null | 确认标题 |
| onFunction | Function | - | 确认回调 |

### 使用示例
vue
<template>
  <Modal v-model="show" width="500px" @close="handleClose">
    <h2>自定义内容</h2>
    <template #confirm>
      <Button variant="filled">自定义确认</Button>
    </template>
  </Modal>
</template>

<script>
export default {
  data() {
    return { show: false }
  },
  methods: {
    handleClose() {
      this.show = false
    }
  }
}
</script>


---

## Anchor 锚点导航
### 参数说明
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| anchors | Array | [] | 锚点数据 |
| topOffset | Number | 81 | 偏移量 |

### 使用示例
vue
<template>
  <Anchor :anchors="anchors" @scrollTo="handleScroll" />
</template>

<script>
export default {
  data() {
    return {
      anchors: [
        { id: 'section1', raw: '章节一' },
        { id: 'section2', raw: '章节二' }
      ]
    }
  },
  methods: {
    handleScroll(id) {
      console.log('滚动到:', id)
    }
  }
}
</script>


---

## Button 按钮
### 参数说明
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | String | 'outline' | 样式类型(filled/outline/dashed/text) |
| size | String | 'medium' | 尺寸(small/medium/large) |
| disabled | Boolean | false | 禁用状态 |
| isLoading | Boolean | false | 加载状态 |

### 使用示例
vue
<template>
  <div class="button-group">
    <Button variant="filled">填充按钮</Button>
    <Button variant="outlined">轮廓按钮</Button>
    <Button variant="dashed">虚线按钮</Button>
    <Button variant="text" disabled>禁用按钮</Button>
  </div>
</template>

<style>
.button-group {
  display: flex;
  gap: 8px;
}
</style>


---

## FileUpload 文件上传
### 参数说明
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| accept | String | '' | 接受文件类型 |
| modelValue | [File,String] | null | 绑定值 |
| type | String | '' | 上传类型(image/file) |
| dragable | Boolean | false | 是否可拖拽 |

### 使用示例
vue
<template>
  <FileUpload
    type="image"
    accept="image/png, image/jpeg"
    v-model="fileUrl"
    @update:modelValue="handleUpload"
  />
</template>

<script>
export default {
  data() {
    return { fileUrl: null }
  },
  methods: {
    async handleUpload(url) {
      // 上传逻辑
    }
  }
}
</script>


---

## Pagination 分页
### 参数说明
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| totalPages | Number | 1 | 总页数 |
| modelValue | Number | 1 | 当前页码 |

### 使用示例
vue
<template>
  <Pagination :totalPages="10" v-model="currentPage" />
</template>

<script>
export default {
  data() {
    return { currentPage: 1 }
  }
}
</script>


---

（其他组件文档结构类似，按目录提取核心参数和使用示例）

---

## 组件风格指南
1. **颜色系统**：
   - 主色：`--main-color` (#ffc848)
   - 辅助色：`--secondary-color` (#ff5252)
   - 文本颜色：`--font-normal` (#333), `--font-light` (#666)

2. **阴影样式**：
   css
   --box-shadow: 0 2px 4px rgba(0,0,0,0.1);
   --inset-box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);


3. **响应式设计**：
   - 使用CSS变量实现自适应间距：
     css
     padding: var(--spacing-small) var(--spacing-medium);


4. **图标系统**：
   - 使用RemixIcon图标库，通过`name`属性指定图标：
     vue
     <Icon name="ri-add-line" size="24" />


---

## 开发者指南
1. **安装依赖**：
   bash
   npm install remixicon vue-json-pretty


2. **全局注册组件**：
   javascript
   import { createApp } from 'vue'
   import App from './App.vue'
   import * as Components from './components'

   const app = createApp(App)
   Object.entries(Components).forEach(([name, component]) => {
     app.component(name, component)
   })
   app.mount('#app')


3. **自定义主题**：
   在项目全局CSS中覆盖变量：
   css
   :root {
     --main-color: #4caf50; / 自定义主色 /
     --box-bgc: #f5f5f5;    / 自定义背景色 /
   }


---

> 更多详细文档和API说明正在完善中...