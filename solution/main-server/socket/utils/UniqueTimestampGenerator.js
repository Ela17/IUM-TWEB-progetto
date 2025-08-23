/**
 * @class UniqueTimestampGenerator
 * @description Generatore singleton di identificatori univoci basati su timestamp per il sistema di chat.
 *
 * Questa classe implementa un algoritmo di generazione di ID univoci che combina:
 * - Timestamp in millisecondi (precisione temporale)
 * - Contatore incrementale (gestione collisioni nello stesso millisecondo)
 *
 * **Perchè serve:**
 * Nel sistema di chat con molti utenti simultanei, è possibile che più messaggi
 * vengano inviati nello stesso millisecondo. Un semplice timestamp non garantirebbe
 * l'unicità degli ID, causando potenziali conflitti nel database.
 */
class UniqueTimestampGenerator {
  constructor() {
    this.lastTimestamp = 0;
    this.counter = 0;
  }

  /**
   * Genera un ID univoco combinando il timestamp corrente con un contatore incrementale.
   * @returns {string} un ID univoco nel formato "timestamp_counter"
   */
  generateId() {
    const currentTimestamp = Date.now();
    if (currentTimestamp === this.lastTimestamp) this.counter++;
    else {
      this.counter = 0;
      this.lastTimestamp = currentTimestamp;
    }

    // Formatta contatore con padding a 3 cifre
    // 0 -> "000", 1 -> "001", 999 -> "999", 1000 -> "1000"
    const paddedCounter = this.counter.toString().padStart(3, "0");

    return `${currentTimestamp}_${paddedCounter}`;
  }
}

module.exports = new UniqueTimestampGenerator(); // singleton
