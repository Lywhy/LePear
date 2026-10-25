import { fileURLToPath, URL } from "node:url";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "YOUTUBE_");
  const apiPort = env.YOUTUBE_API_PORT || "8787";
  if (
    !/^\d{4,5}$/.test(apiPort) ||
    Number(apiPort) > 65535 ||
    Number(apiPort) < 1024
  )
    throw new Error("Invalid YOUTUBE_API_PORT");
  const proxy = {
    "/api": { target: "http://127.0.0.1:" + apiPort, changeOrigin: true },
  };
  return {
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    plugins: [
      react(),
      tailwindcss(),
      babel({ presets: [reactCompilerPreset()] }),
    ],
    server: { host: "0.0.0.0", port: 5173, proxy },
    preview: { proxy },
  };
});
