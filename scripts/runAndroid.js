#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// Função para verificar se servidor está online
function isServerRunning() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/pubmed/search?keyword=test', (res) => {
      resolve(res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
  });
}

// Aguarda o servidor estar pronto
async function waitForServer(maxAttempts = 30) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    if (await isServerRunning()) {
      console.log('✅ Servidor pronto!\n');
      return true;
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  console.warn('⚠️ Servidor pode não estar pronto, continuando mesmo assim...\n');
  return false;
}

// Inicia o servidor Express
console.log('🚀 Iniciando servidor Express na porta 3000...\n');
const server = spawn('node', [path.join(__dirname, '../server.js')], {
  stdio: 'inherit',
  shell: true,
});

let androidProcess = null;

server.on('error', (err) => {
  console.error('❌ Erro ao iniciar servidor:', err);
  process.exit(1);
});

// Aguarda servidor ficar pronto e depois inicia React Native
(async () => {
  await waitForServer();
  
  console.log('📱 Iniciando React Native no Android...\n');
  
  androidProcess = spawn('npx', ['react-native', 'run-android'], {
    stdio: 'inherit',
    shell: true,
  });

  androidProcess.on('exit', (code) => {
    console.log(`\n❌ React Native encerrado com código ${code}`);
    server.kill();
    process.exit(code);
  });

  androidProcess.on('error', (err) => {
    console.error('Erro ao executar React Native:', err);
    server.kill();
    process.exit(1);
  });
})();

// Trata Ctrl+C para encerrar ambos os processos
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando...');
  if (androidProcess) {
    androidProcess.kill();
  }
  server.kill();
  process.exit(0);
});

