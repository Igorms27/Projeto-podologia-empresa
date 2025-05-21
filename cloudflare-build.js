// Script para substituir variáveis de ambiente em cloudflare-env.js e index.html
const fs = require('fs');
const path = require('path');

// Função para substituir placeholders
function replaceEnvPlaceholders(content) {
  content = content.replace(/__FIREBASE_API_KEY__/g, process.env.FIREBASE_API_KEY || '');
  content = content.replace(/__FIREBASE_AUTH_DOMAIN__/g, process.env.FIREBASE_AUTH_DOMAIN || '');
  content = content.replace(/__FIREBASE_PROJECT_ID__/g, process.env.FIREBASE_PROJECT_ID || '');
  content = content.replace(
    /__FIREBASE_STORAGE_BUCKET__/g,
    process.env.FIREBASE_STORAGE_BUCKET || ''
  );
  content = content.replace(
    /__FIREBASE_MESSAGING_SENDER_ID__/g,
    process.env.FIREBASE_MESSAGING_SENDER_ID || ''
  );
  content = content.replace(/__FIREBASE_APP_ID__/g, process.env.FIREBASE_APP_ID || '');
  content = content.replace(
    /__FIREBASE_MEASUREMENT_ID__/g,
    process.env.FIREBASE_MEASUREMENT_ID || ''
  );
  return content;
}

// Paths dos arquivos
const distDir = path.join(__dirname, 'dist/demo');
const htmlPath = path.join(distDir, 'index.html');

// Processar o arquivo HTML principal
if (fs.existsSync(htmlPath)) {
  console.log('Processando index.html...');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  htmlContent = replaceEnvPlaceholders(htmlContent);
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ Variáveis de ambiente substituídas no HTML com sucesso!');
} else {
  console.error('❌ Arquivo index.html não encontrado na pasta de dist!');
}

// Também processa o arquivo cloudflare-env.js por compatibilidade
const envScriptPath = path.join(distDir, 'cloudflare-env.js');
if (fs.existsSync(envScriptPath)) {
  console.log('Processando cloudflare-env.js...');
  let scriptContent = fs.readFileSync(envScriptPath, 'utf8');
  scriptContent = replaceEnvPlaceholders(scriptContent);
  fs.writeFileSync(envScriptPath, scriptContent, 'utf8');
  console.log('✅ Variáveis de ambiente substituídas no script com sucesso!');
} else {
  console.log('❓ Arquivo cloudflare-env.js não encontrado (isso é esperado)');
}

console.log('✅ Processamento de variáveis de ambiente concluído!');
