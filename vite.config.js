import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  server: {
    port: 3000,
    open: true,
    // 🔒 보안: localhost 전용 — 외부 IP/네트워크에서 접근 불가
    // 실 데이터(hs-employees.json) 사용 시 필수 설정
    host: false,
    strictPort: true,
  }
})

