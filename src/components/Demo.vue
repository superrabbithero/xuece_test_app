<template>
  <div class="script-manager-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="logo">
        <el-icon :size="24"><Monitor /></el-icon>
        <span>脚本工具工作台</span>
      </div>
      <div class="user-actions">
        <el-button circle icon="Setting" />
        <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
      </div>
    </header>

    <div class="main-container">
      <!-- 左侧目录树 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <el-input v-model="filterText" placeholder="搜索脚本..." prefix-icon="Search" />
        </div>
        <el-scrollbar>
          <el-tree
            ref="treeRef"
            class="filter-tree"
            :data="treeData"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            highlight-current
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <el-icon v-if="data.type === 'folder'" class="tree-icon"><Folder /></el-icon>
                <el-icon v-else class="tree-icon script-icon"><Document /></el-icon>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </aside>

      <!-- 右侧内容区 -->
      <main class="content-area">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-bar">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>根目录</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in currentPath" :key="item">{{ item }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 场景A: 如果没有选择或选择了文件夹，显示子项网格 -->
        <div v-if="!currentNode || currentNode.type === 'folder'" class="folder-view">
          <div class="view-header">
            <h2>{{ currentNode ? currentNode.label : '所有模块' }}</h2>
            <span class="sub-text">包含 {{ currentChildren.length }} 个项目</span>
          </div>
          
          <div class="grid-container">
            <el-card 
              v-for="item in currentChildren" 
              :key="item.id" 
              class="grid-item" 
              shadow="hover"
              @click="triggerNodeClick(item)"
            >
              <div class="card-content">
                <el-icon :size="40" :class="item.type === 'folder' ? 'folder-color' : 'file-color'">
                  <component :is="item.type === 'folder' ? 'Folder' : 'Document'" />
                </el-icon>
                <span class="grid-label">{{ item.label }}</span>
                <span class="grid-desc">{{ item.desc || '暂无描述' }}</span>
              </div>
            </el-card>
          </div>
          <el-empty v-if="currentChildren.length === 0" description="此文件夹为空" />
        </div>

        <!-- 场景B: 如果选择了脚本文件，显示操作面板 -->
        <div v-else class="script-view">
          <div class="script-header">
            <div class="script-title">
              <el-icon :size="28" class="file-color"><Document /></el-icon>
              <div>
                <h1>{{ currentNode.label }}</h1>
                <el-tag size="small" type="success">Python</el-tag>
                <span class="script-id">ID: {{ currentNode.id }}</span>
              </div>
            </div>
            <div class="script-actions">
              <el-button type="primary" icon="VideoPlay" @click="runScript" :loading="isRunning">运行脚本</el-button>
              <el-button icon="EditPen">编辑代码</el-button>
              <el-button type="danger" icon="Delete" plain>删除</el-button>
            </div>
          </div>

          <div class="script-details">
            <el-descriptions border title="脚本信息" :column="2">
              <el-descriptions-item label="创建时间">2023-10-20</el-descriptions-item>
              <el-descriptions-item label="最后运行">2023-11-15 10:00</el-descriptions-item>
              <el-descriptions-item label="描述">{{ currentNode.desc }}</el-descriptions-item>
              <el-descriptions-item label="参数">
                 <el-tag size="small">--target=prod</el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 模拟终端输出 -->
          <div class="terminal-window">
            <div class="terminal-header">
              <span>控制台输出</span>
              <el-button link size="small" @click="logs = []">清空</el-button>
            </div>
            <div class="terminal-body" ref="terminalRef">
              <div v-if="logs.length === 0" class="placeholder">准备就绪...</div>
              <div v-for="(log, index) in logs" :key="index" class="log-line">
                <span class="log-time">[{{ log.time }}]</span>
                <span :class="['log-msg', log.type]">{{ log.msg }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { 
  Monitor, Search, Folder, Document, VideoPlay, 
  EditPen, Delete, Setting 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// --- 数据模拟 (支持三级: 模块 -> 子模块 -> 脚本) ---
const mockData = [
  {
    id: 1,
    label: '系统运维模块',
    type: 'folder',
    desc: '包含服务器监控与清理脚本',
    children: [
      {
        id: 11,
        label: '日志清理',
        type: 'folder',
        desc: 'Nginx与Docker日志处理',
        children: [
          { id: 111, label: 'Clean_Nginx_Logs.sh', type: 'file', desc: '归档并清理Nginx日志', lang: 'Shell' },
          { id: 112, label: 'Prune_Docker.sh', type: 'file', desc: '清理未使用的镜像', lang: 'Shell' }
        ]
      },
      {
        id: 12,
        label: '服务器监控',
        type: 'folder',
        desc: 'CPU与内存监控',
        children: [
          { id: 121, label: 'Monitor_CPU.py', type: 'file', desc: '上报CPU使用率', lang: 'Python' }
        ]
      }
    ]
  },
  {
    id: 2,
    label: '数据处理工具',
    type: 'folder',
    desc: 'Excel与数据库脚本',
    children: [
      { id: 21, label: 'Excel_To_Json.js', type: 'file', desc: '转换配置表', lang: 'NodeJS' }
    ]
  }
]

// --- 状态定义 ---
const treeData = ref(mockData)
const filterText = ref('')
const treeRef = ref(null)
const currentNode = ref(null)
const currentPath = ref([]) // 用于面包屑
const isRunning = ref(false)
const logs = ref([])
const terminalRef = ref(null)

const defaultProps = {
  children: 'children',
  label: 'label',
}

// --- 核心逻辑 ---

// 1. 搜索过滤
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.includes(value)
}

// 2. 节点点击处理
const handleNodeClick = (data, node) => {
  currentNode.value = data
  // 计算面包屑路径
  const path = []
  let parent = node.parent
  path.push(data.label)
  while(parent && parent.level > 0) {
    path.unshift(parent.data.label)
    parent = parent.parent
  }
  currentPath.value = path
  
  // 切换脚本时清空日志
  if(data.type === 'file') {
    logs.value = []
  }
}

// 手动触发 Tree 的点击（用于网格视图点击文件夹）
const triggerNodeClick = (item) => {
  // 这是一个简化的逻辑，实际开发中可能需要通过 key 获取 node 实例
  // 这里简单将 currentNode 设为点击项，以进入下一级
  currentNode.value = item
  // 更新 Tree 的高亮（可选）
  treeRef.value.setCurrentKey(item.id)
}

// 计算当前视图应该显示的子项（用于文件夹视图）
const currentChildren = computed(() => {
  if (!currentNode.value) return treeData.value // 根目录
  return currentNode.value.children || []
})

// 3. 模拟运行脚本
const runScript = () => {
  isRunning.value = true
  logs.value = []
  logs.value.push({ time: new Date().toLocaleTimeString(), msg: `开始执行 ${currentNode.value.label}...`, type: 'info' })
  
  let count = 0
  const interval = setInterval(() => {
    count++
    logs.value.push({ 
      time: new Date().toLocaleTimeString(), 
      msg: `正在处理数据块 [${count}/5]...`, 
      type: 'normal' 
    })
    
    // 滚动到底部
    nextTick(() => {
      if(terminalRef.value) terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    })

    if (count >= 5) {
      clearInterval(interval)
      logs.value.push({ time: new Date().toLocaleTimeString(), msg: `执行成功!`, type: 'success' })
      isRunning.value = false
      ElMessage.success('脚本执行完成')
    }
  }, 800)
}
</script>

<style scoped lang="scss">
.script-manager-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  color: #303133;
}

.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bold;
    font-size: 18px;
    color: #409eff;
  }
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧侧边栏 */
.sidebar {
  width: 260px;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  
  .sidebar-header {
    padding: 15px;
    border-bottom: 1px solid #f0f2f5;
  }
  
  .custom-tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    
    .tree-icon { color: #e6a23c; }
    .script-icon { color: #909399; }
  }
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  
  .breadcrumb-bar {
    margin-bottom: 20px;
  }
}

/* 文件夹网格视图 */
.folder-view {
  .view-header {
    margin-bottom: 20px;
    h2 { margin: 0 0 5px 0; }
    .sub-text { color: #909399; font-size: 14px; }
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }

  .grid-item {
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: translateY(-3px);
    }
    
    .card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 10px;
      
      .folder-color { color: #e6a23c; margin-bottom: 10px; }
      .file-color { color: #409eff; margin-bottom: 10px; }
      .grid-label { font-weight: bold; margin-bottom: 5px; }
      .grid-desc { font-size: 12px; color: #909399; }
    }
  }
}

/* 脚本详情视图 */
.script-view {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  height: 100%;

  .script-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    
    .script-title {
      display: flex;
      gap: 15px;
      align-items: center;
      .file-color { color: #409eff; }
      h1 { margin: 0; font-size: 22px; }
      .script-id { color: #c0c4cc; font-size: 12px; margin-left: 10px;}
    }
  }

  .script-details {
    margin-bottom: 20px;
  }

  .terminal-window {
    flex: 1;
    background: #1e1e1e;
    border-radius: 6px;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 300px;
    
    .terminal-header {
      background: #2d2d2d;
      padding: 5px 15px;
      color: #ccc;
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    .terminal-body {
      flex: 1;
      padding: 15px;
      font-family: 'Consolas', monospace;
      font-size: 14px;
      color: #d4d4d4;
      overflow-y: auto;
      
      .placeholder { color: #666; font-style: italic; }
      .log-line { margin-bottom: 4px; }
      .log-time { color: #569cd6; margin-right: 10px; }
      .info { color: #9cdcfe; }
      .success { color: #4ec9b0; }
      .normal { color: #ce9178; }
    }
  }
}
</style>