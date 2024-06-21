const express = require('express'); // Importiert das Express-Framework
const path = require('path'); // Importiert das Path-Modul von Node.js für Dateipfade
const fs = require('fs'); // Importiert das Filesystem-Modul von Node.js
const app = express(); // Erstellt eine Express-Anwendung
const server = require('http').createServer(app); // Erstellt einen HTTP-Server
const WebSocket = require('ws'); // Importiert das WebSocket-Modul
const wss = new WebSocket.Server({ server }); // Erstellt einen WebSocket-Server und bindet ihn an den HTTP-Server
const routes = require('./routes'); // Importiert die Routen
const bodyParser = require('body-parser'); // Importiert Body-Parser-Middleware

console.log('Setting up middleware...'); // Log-Anweisung zur Überprüfung

app.use(bodyParser.json()); // Middleware zum Parsen von JSON-Body
app.use(bodyParser.urlencoded({ extended: true })); // Middleware zum Parsen von URL-kodiertem Body

const UPLOAD_DIR = path.join(__dirname, 'uploads'); // Pfad zum Upload-Verzeichnis
const PUBLIC_DIR = path.join(__dirname, '../public'); // Pfad zum öffentlichen Verzeichnis

// Stellt sicher, dass das Upload-Verzeichnis existiert
if (!fs.existsSync(UPLOAD_DIR)) {
    console.log(`Creating upload directory at ${UPLOAD_DIR}`); // Log-Anweisung zur Überprüfung
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR)); // Statische Dateien im Upload-Verzeichnis bereitstellen
app.use(express.static(PUBLIC_DIR)); // Statische Dateien im öffentlichen Verzeichnis bereitstellen
app.use('/api', routes); // Verwendet die API-Routen

console.log('Setting up WebSocket server...'); // Log-Anweisung zur Überprüfung

wss.on('connection', ws => {
    console.log('WebSocket client connected'); // Loggt, wenn ein WebSocket-Client verbunden wird
    ws.on('message', message => {
        console.log('received: %s', message); // Loggt empfangene Nachrichten
    });
});

app.locals.wss = wss; // Speichert den WebSocket-Server in den lokalen Variablen der App

// Funktion zum Senden von Nachrichten an alle verbundenen WebSocket-Clients
const broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

app.locals.broadcast = broadcast; // Speichert die Broadcast-Funktion in den lokalen Variablen der App

const PORT = process.env.PORT || 3000; // Definiert den Port für den Server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Uploads directory: ${UPLOAD_DIR}`);
    console.log(`Public directory: ${PUBLIC_DIR}`);
});
