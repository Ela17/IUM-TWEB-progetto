#!/usr/bin/env node

/**
 * @file stop-server.js
 * @description Script per terminare forzatamente il server sulla porta 3000
 */

const { exec } = require("child_process");

console.log("🛑 Terminazione forzata del server sulla porta 3000...");

// Trova e termina il processo sulla porta 3000
exec("netstat -ano | findstr :3000", (error, stdout, stderr) => {
  if (error) {
    console.error(
      "❌ Errore nel trovare processi sulla porta 3000:",
      error.message,
    );
    return;
  }

  if (!stdout) {
    console.log("✅ Nessun processo trovato sulla porta 3000");
    return;
  }

  // Estrai il PID dalla prima riga che contiene LISTENING
  const lines = stdout.split("\n");
  const listeningLine = lines.find((line) => line.includes("LISTENING"));

  if (!listeningLine) {
    console.log("⚠️ Nessun processo in ascolto sulla porta 3000");
    return;
  }

  const parts = listeningLine.trim().split(/\s+/);
  const pid = parts[parts.length - 1];

  if (!pid || isNaN(pid)) {
    console.error("❌ Impossibile estrarre il PID");
    return;
  }

  console.log(`🎯 Terminazione processo PID: ${pid}`);

  // Termina il processo
  exec(`taskkill /PID ${pid} /F`, (killError, killStdout, killStderr) => {
    if (killError) {
      console.error(
        "❌ Errore nella terminazione del processo:",
        killError.message,
      );
      return;
    }

    console.log("✅ Processo terminato con successo");
    console.log("📋 Output:", killStdout);
  });
});
