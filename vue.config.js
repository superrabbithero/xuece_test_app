const { defineConfig } = require('@vue/cli-service')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin()  // 注入 Node.js 核心模块的 polyfill
    ],
    resolve: {
      fallback: {
        // 可选项：如果某些模块需要单独配置 fallback
        "fs": false,         // 浏览器无法 polyfill fs
      }
    }
  }
})
