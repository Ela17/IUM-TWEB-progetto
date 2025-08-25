#!/usr/bin/env node

/**
 * @file stop-server.js
 * @description Script per terminare forzatamente il server MongoDB sulla porta 3001
 */

const { exec } = require('child_process');

console.log('🛑 Terminazione forzata del server MongoDB sulla porta 3001...');

// Trova e termina il processo sulla porta 3001
exec('netstat -ano | findstr :3001', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Errore nel trovare processi sulla porta 3001:', error.message);
    return;
  }

  if (!stdout) {
    console.log('✅ Nessun processo trovato sulla porta 3001');
    return;
  }

  // Estrai il PID dalla prima riga che contiene LISTENING
  const lines = stdout.split('\n');
  const listeningLine = lines.find(line => line.includes('LISTENING'));
  
  if (!listeningLine) {
    console.log('⚠️ Nessun processo in ascolto sulla porta 3001');
    return;
  }

  const parts = listeningLine.trim().split(/\s+/);
  const pid = parts[parts.length - 1];

  if (!pid || isNaN(pid)) {
    console.error('❌ Impossibile estrarre il PID');
    return;
  }

  console.log(`🎯 Terminazione processo MongoDB PID: ${pid}`);

  // Termina il processo
  exec(`taskkill /PID ${pid} /F`, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error('❌ Errore nella terminazione del processo:', killError.message);
      return;
    }

    console.log('✅ Processo MongoDB terminato con successo');
    console.log('📋 Output:', killStdout);
  });
});
