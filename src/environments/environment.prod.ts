// Declaração para o TypeScript reconhecer window.ENV
declare global {
  interface Window {
    ENV: {
      FIREBASE_API_KEY: string;
      FIREBASE_AUTH_DOMAIN: string;
      FIREBASE_PROJECT_ID: string;
      FIREBASE_STORAGE_BUCKET: string;
      FIREBASE_MESSAGING_SENDER_ID: string;
      FIREBASE_APP_ID: string;
      FIREBASE_MEASUREMENT_ID: string;
    };
  }
}

export const environment = {
  production: true,
  logLevel: 'ERROR', // Apenas erros em produção
  firebase: {
    apiKey: window.ENV?.FIREBASE_API_KEY || '',
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || '',
    projectId: window.ENV?.FIREBASE_PROJECT_ID || '',
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: window.ENV?.FIREBASE_APP_ID || '',
    measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || '',
  },
};
