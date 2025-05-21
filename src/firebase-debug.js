// Script para monitorar a inicialização do Firebase
console.log('[FIREBASE-DEBUG] Script de depuração carregado');

// Verificar se as variáveis de ambiente estão definidas
console.log('[FIREBASE-DEBUG] Verificando ENV:', window.ENV ? 'disponível' : 'não disponível');

// Interceptar a inicialização do Firebase para depurar
const originalInitializeApp = window.initializeApp || function () {};
window.firebaseInitAttempts = 0;

// Sobrescrever temporariamente para debug
window.initializeApp = function (config) {
  window.firebaseInitAttempts++;
  console.log(
    '[FIREBASE-DEBUG] Tentativa de inicialização do Firebase #' + window.firebaseInitAttempts
  );
  console.log('[FIREBASE-DEBUG] Configuração:', JSON.stringify(config, null, 2));

  if (!config || !config.apiKey) {
    console.error('[FIREBASE-DEBUG] ERRO: Configuração inválida ou sem apiKey');
    console.log('[FIREBASE-DEBUG] ENV neste momento:', window.ENV);
  } else {
    console.log('[FIREBASE-DEBUG] apiKey utilizada:', config.apiKey);
  }

  // Chamar a função original
  return originalInitializeApp.apply(this, arguments);
};
