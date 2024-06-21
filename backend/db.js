const nano = require('nano')('http://admin:YOURPASSWORD@localhost:5984'); // Nano verbindet sich mit CouchDB mit den angegebenen Zugangsdaten
const dbNames = ['cocktails', 'ingredients', 'orders']; // Namen der Datenbanken, die wir verwenden werden

console.log('Initializing databases...'); // Log-Anweisung zur Überprüfung

// Initialisierungsfunktion für die Datenbanken
const initDB = async () => {
  try {
    // Schleife über alle Datenbanknamen
    for (const dbName of dbNames) {
      try {
        await nano.db.get(dbName); // Prüfen, ob die Datenbank existiert
        console.log(`Database "${dbName}" already exists.`);
      } catch (error) {
        if (error.statusCode === 404) { // Wenn die Datenbank nicht existiert, wird sie erstellt
          await nano.db.create(dbName);
          console.log(`Database "${dbName}" created.`);
        } else {
          console.error(`Error checking database existence for "${dbName}":`, error); // Fehler bei der Überprüfung der Datenbank
          throw error;
        }
      }
    }
  } catch (error) {
    console.error('Error during database initialization:', error); // Fehler bei der Initialisierung der Datenbanken
  }
};

// Verbindet sich mit den Datenbanken und speichert die Verbindungen in einem Array
const dbs = dbNames.map(dbName => nano.use(dbName));

console.log('Databases initialized:', dbs.map(db => db.config.db)); // Log-Anweisung zur Überprüfung

module.exports = { dbs, initDB }; // Exportiert die Datenbanken und die Initialisierungsfunktion
