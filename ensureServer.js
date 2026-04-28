#!/usr/bin/env node

/**
 * Setup automático para verificar e iniciar o servidor Express
 * Este arquivo é executado automaticamente quando o projeto é iniciado
 */

const net = require('net');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const SERVER_PORT = 3000;

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

async function ensureServerIsRunning() {
  if (await isServerRunning()) {
    return; // Servidor já está rodando
  }

  // Inicia o servidor
  const serverPath = path.join(__dirname, 'server.js');
  spawn('node', [serverPath], {
    detached: true,
    stdio: 'ignore',
    shell: true,
  }).unref();

  // Aguarda o servidor ficar pronto
  for (let i = 0; i < 20; i++) {
    if (await isServerRunning()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
}

// Verifica automaticamente
ensureServerIsRunning().catch(() => {});
