export const environment = {
  production: true,
  logLevel: 'ERROR', // Apenas erros em produção
  firebase: {
    apiKey: typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_API_KEY || '' : '',
    authDomain:
      typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_AUTH_DOMAIN || '' : '',
    projectId: typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_PROJECT_ID || '' : '',
    storageBucket:
      typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_STORAGE_BUCKET || '' : '',
    messagingSenderId:
      typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_MESSAGING_SENDER_ID || '' : '',
    appId: typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_APP_ID || '' : '',
    measurementId:
      typeof window !== 'undefined' ? (window as any).ENV?.FIREBASE_MEASUREMENT_ID || '' : '',
  },
};
