// Script para substituir variáveis de ambiente em cloudflare-env.js e index.html
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando script de substituição de variáveis de ambiente');
console.log('📋 Variáveis disponíveis:');
console.log(
  '   - FIREBASE_API_KEY:',
  process.env.FIREBASE_API_KEY ? 'Definida (valor oculto)' : 'NÃO DEFINIDA'
);
console.log(
  '   - FIREBASE_AUTH_DOMAIN:',
  process.env.FIREBASE_AUTH_DOMAIN ? 'Definida' : 'NÃO DEFINIDA'
);
console.log(
  '   - FIREBASE_PROJECT_ID:',
  process.env.FIREBASE_PROJECT_ID ? 'Definida' : 'NÃO DEFINIDA'
);
console.log('   - NODE_VERSION:', process.env.NODE_VERSION || 'não definida');

// Função para substituir placeholders
function replaceEnvPlaceholders(content) {
  console.log('   Substituindo placeholders...');

  // Verificar se há placeholders antes da substituição
  const hasPlaceholders = content.includes('__FIREBASE_API_KEY__');
  console.log('   Contém placeholders antes da substituição:', hasPlaceholders);

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

  // Verificar se ainda há placeholders depois da substituição
  const stillHasPlaceholders = content.includes('__FIREBASE_API_KEY__');
  console.log('   Contém placeholders depois da substituição:', stillHasPlaceholders);

  return content;
}

// Paths dos arquivos
const distDir = path.join(__dirname, 'dist/demo');
const htmlPath = path.join(distDir, 'index.html');

// Processar o arquivo HTML principal
if (fs.existsSync(htmlPath)) {
  console.log('📄 Processando index.html...');
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Verificar tamanho e conteúdo antes
  console.log('   Tamanho original:', htmlContent.length, 'bytes');
  console.log('   Contém configuração Firebase:', htmlContent.includes('window.ENV'));

  htmlContent = replaceEnvPlaceholders(htmlContent);

  // Verificar depois da substituição
  console.log('   Tamanho após substituição:', htmlContent.length, 'bytes');

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('✅ Variáveis de ambiente substituídas no HTML com sucesso!');
} else {
  console.error('❌ Arquivo index.html não encontrado na pasta de dist!');
  console.error('   Path completo buscado:', htmlPath);
  console.error(
    '   Conteúdo do diretório dist:',
    fs.existsSync(distDir) ? fs.readdirSync(distDir).join(', ') : 'diretório não existe'
  );
}

// Também processa o arquivo cloudflare-env.js por compatibilidade
const envScriptPath = path.join(distDir, 'cloudflare-env.js');
if (fs.existsSync(envScriptPath)) {
  console.log('📄 Processando cloudflare-env.js...');
  let scriptContent = fs.readFileSync(envScriptPath, 'utf8');
  scriptContent = replaceEnvPlaceholders(scriptContent);
  fs.writeFileSync(envScriptPath, scriptContent, 'utf8');
  console.log('✅ Variáveis de ambiente substituídas no script com sucesso!');
} else {
  console.log('❓ Arquivo cloudflare-env.js não encontrado (isso é esperado)');
}

// Processar o arquivo firebase-debug.js também
const debugScriptPath = path.join(distDir, 'firebase-debug.js');
if (fs.existsSync(debugScriptPath)) {
  console.log('📄 Processando firebase-debug.js...');
  let debugContent = fs.readFileSync(debugScriptPath, 'utf8');
  debugContent = replaceEnvPlaceholders(debugContent);
  fs.writeFileSync(debugScriptPath, debugContent, 'utf8');
  console.log('✅ Variáveis de ambiente substituídas no script de debug com sucesso!');
}

console.log('✅ Processamento de variáveis de ambiente concluído!');
