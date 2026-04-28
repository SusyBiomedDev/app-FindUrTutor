#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');
const os = require('os');

const SERVER_PORT = 3000;
const PID_FILE = path.join(os.tmpdir(), 'FindUrTutor-server.pid');

// Verifica se servidor está rodando
function isServerRunning() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
    socket.connect(SERVER_PORT, '127.0.0.1');
  });
}

// Inicia o servidor
async function startServer() {
  console.log('🚀 Verificando servidor Express...\n');
  
  // Verifica se já está rodando
  if (await isServerRunning()) {
    console.log('✅ Servidor Express já está a rodar na porta 3000\n');
    return;
  }

  console.log('🚀 Iniciando servidor Express na porta 3000...\n');

  const serverPath = path.join(__dirname, 'server.js');
  
  try {
    // Inicia o servidor em background
    const serverProcess = spawn('node', [serverPath], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    // Salva o PID para depois poder encerrar
    fs.writeFileSync(PID_FILE, serverProcess.pid.toString());

    // Aguarda o servidor iniciar
    let attempts = 0;
    while (attempts < 30) {
      if (await isServerRunning()) {
        console.log('✅ Servidor pronto!\n');
        serverProcess.unref();
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    console.warn('⚠️ Servidor pode não estar totalmente pronto, continuando mesmo assim...\n');
    serverProcess.unref();
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err.message);
    process.exit(1);
  }
}

// Executa o React Native
async function runReactNative() {
  await startServer();

  console.log('📱 Iniciando React Native...\n');
  
  const rn = spawn('npx', ['react-native', 'run-android'], {
    stdio: 'inherit',
    shell: true,
  });

  rn.on('exit', (code) => {
    console.log(`\n❌ React Native encerrado com código ${code}`);
    process.exit(code);
  });

  rn.on('error', (err) => {
    console.error('❌ Erro ao executar React Native:', err);
    process.exit(1);
  });
}

// Executa
runReactNative().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
