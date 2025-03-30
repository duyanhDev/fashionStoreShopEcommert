import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  host: "0.0.0.0",
  strictPort: true, // Đảm bảo luôn sử dụng port này
  watch: {
    usePolling: true, // Hỗ trợ hot reload trong Docker
  },
  plugins: [react()],
});
