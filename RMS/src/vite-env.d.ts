// src/vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // Add other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
