// Script para substituir variáveis de ambiente em cloudflare-env.js
const fs = require('fs');
const path = require('path');

// Caminho do arquivo de saída após o build
const outputPath = path.join(__dirname, 'dist/demo/cloudflare-env.js');

// Verifica se o arquivo existe
if (fs.existsSync(outputPath)) {
  // Lê o conteúdo do arquivo
  let content = fs.readFileSync(outputPath, 'utf8');

  // Substitui os placeholders pelas variáveis de ambiente reais
  content = content.replace('__FIREBASE_API_KEY__', process.env.FIREBASE_API_KEY || '');
  content = content.replace('__FIREBASE_AUTH_DOMAIN__', process.env.FIREBASE_AUTH_DOMAIN || '');
  content = content.replace('__FIREBASE_PROJECT_ID__', process.env.FIREBASE_PROJECT_ID || '');
  content = content.replace(
    '__FIREBASE_STORAGE_BUCKET__',
    process.env.FIREBASE_STORAGE_BUCKET || ''
  );
  content = content.replace(
    '__FIREBASE_MESSAGING_SENDER_ID__',
    process.env.FIREBASE_MESSAGING_SENDER_ID || ''
  );
  content = content.replace('__FIREBASE_APP_ID__', process.env.FIREBASE_APP_ID || '');
  content = content.replace(
    '__FIREBASE_MEASUREMENT_ID__',
    process.env.FIREBASE_MEASUREMENT_ID || ''
  );

  // Escreve o conteúdo de volta para o arquivo
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log('✅ Variáveis de ambiente do Cloudflare substituídas com sucesso!');
} else {
  console.error('❌ Arquivo cloudflare-env.js não encontrado na pasta de dist!');
}
