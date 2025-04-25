// src/components/index.js
export default {
  install(app) {
    // ✅ Webpack 环境使用 require.context
    const req = require.context('./ui', true, /\.vue$/);
    
    req.keys().forEach(key => {
      const component = req(key).default;
      const name = key.split('/').pop().replace(/\.\w+$/, '');
      app.component(name, component);
    });
  }
};