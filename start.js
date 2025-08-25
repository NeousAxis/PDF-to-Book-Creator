// Script de démarrage personnalisé pour éviter les problèmes avec path-to-regexp
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Démarrage du serveur avec des paramètres personnalisés...');

// Forcer l'utilisation d'une version spécifique de path-to-regexp
process.env.NODE_PATH = join(__dirname, 'node_modules');

// Démarrer le serveur
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env }
});

server.on('close', (code) => {
  console.log(`Le serveur s'est arrêté avec le code: ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  server.kill('SIGINT');
});