// Script para disponibilizar variáveis de ambiente da Cloudflare Pages
console.log('Inicializando variáveis de ambiente do Firebase');

// Garantir que o objeto ENV esteja sempre disponível
window.ENV = {
  FIREBASE_API_KEY: '__FIREBASE_API_KEY__',
  FIREBASE_AUTH_DOMAIN: '__FIREBASE_AUTH_DOMAIN__',
  FIREBASE_PROJECT_ID: '__FIREBASE_PROJECT_ID__',
  FIREBASE_STORAGE_BUCKET: '__FIREBASE_STORAGE_BUCKET__',
  FIREBASE_MESSAGING_SENDER_ID: '__FIREBASE_MESSAGING_SENDER_ID__',
  FIREBASE_APP_ID: '__FIREBASE_APP_ID__',
  FIREBASE_MEASUREMENT_ID: '__FIREBASE_MEASUREMENT_ID__',
};

// Log para debug durante a inicialização
console.log('Variáveis de ambiente carregadas');
