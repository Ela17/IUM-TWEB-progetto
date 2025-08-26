function standardErrorHandler(err, req, res, next) {
  let statusCode = err.status || err.statusCode || 500;
  let userMessage = "Si è verificato un errore interno del server";
  let errorMessage = err.message || null;
  let errorCode = err.code || "INTERNAL_SERVER_ERROR";
  let additionalDetails = err.additionalDetails || null;
  let logLevel = "error";

  if (
    err.name === "ValidationError" ||
    (typeof err.code === "string" && err.code.startsWith("VALIDATION_"))
  ) {
    statusCode = 400;
    userMessage = "Errore di validazione";
    errorCode = err.code || "VALIDATION_ERROR";
    logLevel = "warn";
  } else if (
    err.code === "ECONNREFUSED" ||
    (typeof err.code === "string" && err.code?.includes("SERVICE_UNAVAILABLE"))
  ) {
    // Errori di servizi esterni: problemi con microservizi o database

    statusCode = 503;
    userMessage = "Il servizio è temporaneamente non disponibile.";
    errorCode = err.code || "SERVICE_UNAVAILABLE";
    logLevel = "error";
  } else if (
    err.status === 404 ||
    (typeof err.code === "string" && err.code?.includes("NOT_FOUND"))
  ) {
    // Risorsa non trovata: l'ID richiesto non esiste
    statusCode = 404;
    userMessage = "La risorsa richiesta non è stata trovata.";
    errorCode = err.code || "RESOURCE_NOT_FOUND";
    logLevel = "info";
  } else if (err.status && err.status >= 400 && err.status < 500) {
    // Altri errori client: mantieni il status code originale se ragionevole
    statusCode = err.status;
    userMessage = "Errore nella richiesta";
    errorCode = err.code || "CLIENT_ERROR";
    logLevel = "warn";
  }

  const logEntry = {
    metadata: {
      timestamp: new Date().toISOString(),
      level: logLevel,
    },

    error: {
      errorName: err.name,
      statusCode: statusCode,
      errorMessage: errorMessage,
      userMessage: userMessage,
      code: errorCode,
    },
    additionalDetails: { ...additionalDetails },
    stack: err.stack?.split("\n"),
  };

  if (logLevel === "error") {
    console.error("CRITICAL ERROR:", JSON.stringify(logEntry, null, 2));
  } else if (logLevel === "warn") {
    console.warn("WARNING:", JSON.stringify(logEntry, null, 2));
  } else {
    console.info("INFO:", JSON.stringify(logEntry, null, 2));
  }

  // Invio della risposta al client
  res.status(statusCode).json(logEntry);
}

module.exports = standardErrorHandler;
