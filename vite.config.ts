import { UserConfig, ConfigEnv, defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import viteSvgIcons from 'vite-plugin-svg-icons';


// vite.config.js
import WindiCSS from 'vite-plugin-windicss'

import { resolve } from 'path';

import { Recordable, ViteEnv } from './types/global'

// function pathResolve(dir: string) {
//   return resolve(process.cwd(), '.', dir);
// }

function wrapperEnv(envConf: Recordable): ViteEnv {
  const ret: any = {};

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    if (envName === 'VITE_PORT') {
      realName = Number(realName);
    }
    if (envName === 'VITE_PROXY') {
      try {
        realName = JSON.parse(realName);
      } catch (error) { }
    }
    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
  console.log(command)
  const root = process.cwd();

  const env = loadEnv(mode, root);

  // The boolean type read by loadEnv is a string. This function can be converted to boolean type
  const viteEnv = wrapperEnv(env);

  const { VITE_PORT, VITE_PROXY, VITE_DROP_CONSOLE, OUT_DIR, VITE_GLOB_API_URL } = viteEnv
  // console.log(VITE_PORT, VITE_GLOB_API_URL, VITE_PROXY, VITE_DROP_CONSOLE)
  return {
    base: '/',
    root,
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'), //设置别名
        'types': resolve(__dirname, 'types'),
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
      port: VITE_PORT,
      open: false,
      proxy: {
        [VITE_GLOB_API_URL]: {
          target: VITE_PROXY,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: OUT_DIR,
      rollupOptions: {
        output: {
          manualChunks: {
            'ant-design-vue': ['ant-design-vue'],
          },
        },
      },
      terserOptions: {
        compress: {
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
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
