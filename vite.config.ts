import { UserConfig, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteSvgIcons from 'vite-plugin-svg-icons'

// vite.config.js
import WindiCSS from 'vite-plugin-windicss'

import { resolve } from 'path'


export default defineConfig((): UserConfig => {
  return {
    base: '/',
    // root,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), //设置别名
      },
    },
    plugins: [
      vue(),
      WindiCSS(),
      viteSvgIcons({
        // 配置路劲在你的src里的svg存放文件
        iconDirs: [resolve(process.cwd(), 'src/icons')],
        symbolId: 'icon-[dir]-[name]',
      }),
    ],
    server: {
      host: '0.0.0.0',
      port: 8088,
      open: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:7002/api/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/img_url': {
          target: 'http://127.0.0.1:7002',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/img_url/, ''),
        }
      },
    },
    build: {
      outDir: 'www',
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design-vue': ['ant-design-vue'],
          },
        },
      },
      terserOptions: {
        compress: {
          keep_infinity: true, // 传递true以防止Infinity被压缩成1/0，这可能会导致 Chrome 上的性能问题。
          drop_console: true, // 生产环境时移除console
        },
      },
      brotliSize: false,
      chunkSizeWarningLimit: 2000,
    },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "@/assets/styles/global.less";`,
          },
          javascriptEnabled: true,
        },
      },
    },
  }
})
