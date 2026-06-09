declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      DB_NAME: string;
      PORT: string;
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD: string;
      ADMIN_SESSION_ID: string;
      IMAGEKIT_PUBLIC_KEY: string;
      IMAGEKIT_PRIVATE_KEY: string;
      IMAGEKIT_URL_ENDPOINT: string;
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_SITE_NAME: string;
    }
  }
}

export {};
