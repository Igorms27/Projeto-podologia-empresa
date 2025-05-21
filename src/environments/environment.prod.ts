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
    firebaseInitAttempts: number;
  }
}

// Função para obter configurações com tentativa de debugging
function getFirebaseConfig() {
  console.log('[ENV-DEBUG] Lendo configuração do Firebase');

  // Log de informações sobre ambiente
  console.log('[ENV-DEBUG] window.ENV disponível:', !!window.ENV);

  const config = {
    apiKey: window.ENV?.FIREBASE_API_KEY || '',
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || '',
    projectId: window.ENV?.FIREBASE_PROJECT_ID || '',
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: window.ENV?.FIREBASE_APP_ID || '',
    measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || '',
  };

  console.log('[ENV-DEBUG] Configuração obtida:', config);

  return config;
}

export const environment = {
  production: true,
  logLevel: 'ERROR', // Apenas erros em produção
  firebase: getFirebaseConfig(),
};
