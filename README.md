## Punnti chiave per l'implementazione del progetto:

### Front-end
La pagina web deve essere realizzata con HTML, Javascript, CSS e Handlebars e deve consentire di interrogare ed esplorare i dati relativi ai film. Questa pagina web deve fornire un'interfaccia utente per consentire a fan e giornalisti di accedere ai dati sui film. Le principali funzionalità richieste includono:
- Query dei dati: La pagina deve permettere agli utenti di eseguire query sui dati.
- Esplorazione dei dati: Oltre alla possibilità di interrogare, la pagina web deve consentire agli utenti di esplorare i dati disponibili.
- Interfaccia utente: La pagina web deve fornire un'interfaccia utente accessibile e facile da usare per i fan e giornalisti.
- Visualizzazione dei risultati: La pagina deve presentare i risultati delle query in un formato chiaro e comprensibile. 

In sintesi, la pagina web deve essere progettata per facilitare l'accesso e l'analisi dei dati sui film da parte di diversi tipi di utenti.

---

### Server

- Javascript (Express): Alcuni server devono essere implementati in Javascript utilizzando il framework Express. In particolare è richiesto un server centrale implementato in Express che comunichi con altri server per l'accesso al database.
- Java (Spring Boot): Alcuni server devono essere implementati in Java utilizzando Spring Boot. Almeno uno dei server che comunicano con il server centrale deve essere scritto in Java Spring Boot.
- Python (Flask): Alcuni server possono essere implementati in Python usando il framework Flask.

---

### Database

- Dati dinamici: I dati con un tasso di cambiamento elevato, come le recensioni e gli incassi, devono essere memorizzati in un database MongoDB.
- Dati statici: I dati più statici, come le informazioni sugli attori, i loro film e i vincitori degli Oscar, devono essere memorizzati in un database PostGres.

---

### Visualizzazione Dati: Guida Jupyter Notebook

I Jupyter Notebook devono includere una vasta gamma di visualizzazioni e non limitarsi a un solo tipo di grafico, come i grafici a barre. È necessario includere anche alcune visualizzazioni geografiche. In generale, si richiede di utilizzare una varietà di tipi di visualizzazione per l'analisi dei dati.

In sintesi, le visualizzazioni richieste nel Jupyter Notebook sono:
- Varietà di visualizzazioni: Non limitarsi a un solo tipo di grafico, come i grafici a barre.
- Visualizzazioni geografiche: Includere anche alcune visualizzazioni geografiche.

L'obiettivo è quello di mostrare una comprensione approfondita dei dati attraverso diverse rappresentazioni grafiche. I Jupyter Notebook devono essere forniti in formato eseguito, mostrando tutti i grafici e le tabelle, senza la necessità di eseguirli durante la valutazione.

---

### Chat

Viene richiesto un sistema di chat tra fan ed esperti per discutere di argomenti specifici. Questo sistema di chat deve essere implementato utilizzando socket.io.

Caratteristiche principali del sistema di chat richiesto:
- Implementazione: Il sistema di chat deve essere implementato usando la libreria socket.io.
- Stanze tematiche: Le discussioni devono essere organizzate in stanze tematiche specifiche, ad esempio, stanze dedicate a un particolare film o attore.
- Partecipanti: Il sistema di chat è pensato per consentire la comunicazione tra fan ed esperti (giornalisti).
