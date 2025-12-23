import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數，這讓本地開發 (.env) 和 Vercel 部署環境都能運作
  // 第三個參數 '' 表示載入所有變數，不限制 VITE_ 前綴
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // 這裡的設定會讓程式碼中的 `process.env.API_KEY` 在打包時被替換成實際的值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});