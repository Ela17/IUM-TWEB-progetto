/**
 * Middleware di gestione centralizzata degli errori.
 * Standardizza la formattazione delle risposte di errore
 * e gestisce il logging basato sulla gravità dell'errore, distinguendo
 * tra errori interni, di validazione, di servizio e client.
 *
 * @param {Error} err L'oggetto errore passato dal middleware precedente.
 * Può contenere proprietà come `status`, `statusCode`, `message`, `code`,
 * e `additionalDetails`.
 * @param {import('express').Request} req L'oggetto request di Express.
 * @param {import('express').Response} res L'oggetto response di Express.
 * @param {import('express').NextFunction} next La funzione next di Express.
 * La funzione `next` non è usata per terminare la catena, infatti non si intende delegare ulteriormente l'errore.
 *
 * @returns {void} Invia una risposta JSON standardizzata al client con lo stato HTTP appropriato.
 */
function standardErrorHandler(err, req, res, next) {
  let statusCode = err.status || err.statusCode || 500;
  let userMessage = "Internal Server Error";
  let errorMessage = err.message || null;
  let errorCode = err.code || "INTERNAL_SERVER_ERROR";
  let additionalDetails = err.additionalDetails || null;
  let logLevel = "error";

  if (err.name === "ValidationError" || err.code?.startsWith("VALIDATION_")) {
    statusCode = 400;
    userMessage = "Validation Error";
    errorCode = err.code || "VALIDATION_ERROR";
    logLevel = "warn";
  } else if (
    err.code === "ECONNREFUSED" ||
    err.code?.includes("SERVICE_UNAVAILABLE")
  ) {
    // Errori di servizi esterni: problemi con microservizi o database
    statusCode = 503;
    userMessage = "Service Temporary Unavailable";
    errorCode = err.code || "SERVICE_UNAVAILABLE";
    logLevel = "error";
  } else if (err.status === 404 || err.code?.includes("NOT_FOUND")) {
    // Risorsa non trovata: l'ID richiesto non esiste
    statusCode = 404;
    userMessage = "Resource Not Found";
    errorCode = err.code || "RESOURCE_NOT_FOUND";
    logLevel = "info";
  } else if (err.status && err.status >= 400 && err.status < 500) {
    // Altri errori client: mantieni status code originale se ragionevole
    statusCode = err.status;
    userMessage = "Client Request Error";
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
      errorCode: errorCode,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    },
    additionalDetails: { ...additionalDetails },
    stack: err.stack?.split("\n"),
  };

  // Console logging basato sul livello di log
  if (logLevel === "error") {
    console.error("CRITICAL ERROR:", JSON.stringify(logEntry, null, 2));
  } else if (logLevel === "warn") {
    console.warn("WARNING:", JSON.stringify(logEntry, null, 2));
  } else {
    console.info("INFO:", JSON.stringify(logEntry, null, 2));
  }

  // GESTIONE RISPOSTA: HTML vs JSON

  // Determina se la richiesta è per una API (JSON) o una pagina web (HTML)
  const acceptsJson =
    req.accepts(["html", "json"]) === "json" ||
    req.originalUrl.startsWith("/api");
  const isApiRequest =
    req.originalUrl.startsWith("/api") ||
    req.xhr ||
    req.get("Content-Type") === "application/json";

  if (isApiRequest || acceptsJson) {
    // RISPOSTA JSON PER API
    const response = {
      success: false,
      error: {
        message: userMessage,
        code: errorCode,
        statusCode: statusCode,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
      },
      additionalDetails: { ...additionalDetails },
    };

    if (process.env.NODE_ENV === "development") {
      response.debug = {
        originalMessage: err.message,
        errorName: err.name,
        stack: err.stack?.split("\n").slice(0, 10),
      };
    }

    // Invio della risposta JSON al client
    res.status(statusCode).json(response);
  } else {
    // RENDER PAGINA HTML DI ERRORE

    // Titoli specifici per ogni tipo di errore
    let title = "Error";
    switch (statusCode) {
      case 404:
        title = "Page Not Found";
        break;
      case 403:
        title = "Access Denied";
        break;
      case 500:
        title = "Server Error";
        break;
      default:
        title = `Error ${statusCode}`;
    }

    // Dati per il template error.hbs
    const templateData = {
      title: `${title} - CinemaHub`,
      status: statusCode,
      message: userMessage,
      isDevelopment: process.env.NODE_ENV === "development",
      stack: process.env.NODE_ENV === "development" ? err.stack : null,
    };

    // Render della pagina di errore
    res.status(statusCode).render("pages/error", templateData);
  }
}

module.exports = standardErrorHandler;
