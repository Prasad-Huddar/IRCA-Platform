/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}