interface ImportMetaEnv {
    VITE_BOT_TOKEN: string; 
    VITE_CHAT_ID: string;
    VITE_API_BASE_URL: string;
    VITE_DOMAIN: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }