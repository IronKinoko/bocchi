declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    APP_NAME: string
    APP_VERSION: string
  }
}
