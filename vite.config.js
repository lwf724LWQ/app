import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // 代理后端 /web 开头的接口到真实域名，解决开发环境CORS
      '/web': {
        target: 'http://caimi.s7.tunnelfrp.com',
        changeOrigin: true,
        // 不改写路径，直接透传 /web
        // 如果后端不以 /web 开头，可用 rewrite 重写
        // rewrite: path => path.replace(/^\/web/, '')
      }
    }
  }
})


