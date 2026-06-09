declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      DB_NAME: string;
      PORT: string;
      ADMIN_USERNAME: string;
      ADMIN_PASSWORD: string;
      ADMIN_SESSION_ID: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
      NEXT_PUBLIC_SITE_URL: string;
      NEXT_PUBLIC_SITE_NAME: string;
    }
  }
}

export {};
