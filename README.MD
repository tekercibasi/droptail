# Cocktail Ordering System

## Inhaltsverzeichnis
- [Beschreibung](#beschreibung)
- [Bereits implementierte Features](#bereits-implementierte-features)
  - [Kundenansicht](#kundenansicht)
  - [Barkeeperansicht](#barkeeperansicht)
  - [Backend](#backend)
- [Noch ausstehende Features](#noch-ausstehende-features)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Ordnerstruktur](#ordnerstruktur)
- [Technologien](#technologien)
- [Autoren](#autoren)
- [Lizenz](#lizenz)

## Beschreibung
Das Cocktail-Bestellsystem ist eine Webapplikation für Restaurants, die es Kunden ermöglicht, Cocktails zu bestellen, und Barkeepern die Möglichkeit bietet, Cocktails zu verwalten und Bestellungen zu bearbeiten. Die Applikation nutzt JavaScript, CouchDB und WebSockets.

## Bereits implementierte Features

### Kundenansicht
- **Cocktail-Übersicht**: Kunden können eine Liste von Cocktails mit Titel, Beschreibung und Bildern anzeigen.
- **Bestellungen aufgeben**: Kunden können Cocktails bestellen und Anpassungen angeben.
- **Bestellhistorie**: Kunden können ihre Bestellhistorie einsehen, einschließlich des aktuellen Status der Bestellungen.
- **Suche**: Kunden können Cocktails nach bestimmten Begriffen durchsuchen.

### Barkeeperansicht
- **Cocktail-Verwaltung**: Barkeeper können neue Cocktails hinzufügen, bearbeiten oder löschen.
- **Bestellungsübersicht**: Barkeeper können alle Bestellungen einsehen und den Status ändern.
- **Cocktail-Bearbeitungsmodus**: Bearbeiten von Cocktails mit vorgefüllten Formularen.
- **Modals**: Anzeigen von Rezepten und Bildern der Cocktails in Modals.

### Backend
- **RESTful API**: Endpunkte für CRUD-Operationen auf Cocktails und Bestellungen.
- **WebSockets**: Echtzeit-Updates über den Status von Bestellungen.
- **Datenbank**: CouchDB für die Speicherung von Cocktails und Bestellungen.

## Noch ausstehende Features
- **Zutatenverwaltung**: Separate Datenbank für Zutaten und Integration mit Cocktails.
- **Bestellungen nach Tisch**: Zuordnung von Bestellungen zu Tischen durch QR-Code-Scannen.
- **UI-Verbesserungen**: Optimierung der Benutzeroberfläche.
- **Bilder hochladen**: Verbesserte Bildhochladefunktionalität.
- **Validierung und Fehlerbehandlung**: Verbesserte Formvalidierung und Fehlerbehandlung.
- **Testen und Debugging**: Umfassende Tests und Debugging.
- **Internationalisierung**: Unterstützung für mehrere Sprachen.

## Installation

1. Klonen Sie das Repository:
    ```bash
    git clone git@github.com:tekercibasi/droptail.git
    cd droptail
    ```

2. Installieren Sie die Abhängigkeiten:
    ```bash
    npm install
    ```

3. Order-Datenbank anlegen: 
     ```
    node ./setupOrdersDatabase.js
    ```

4. Optional: Datenbank mit Beispieldaten füllen:
    ```
    node fillDatabase.js 
    node insertDummyOrders.js
    ```

5. Server starten
    ```bash
    node backend/server.js
    ```

## Verwendung

1. Öffnen Sie den Browser und navigieren Sie zu `http://localhost:3000`.
2. Verwenden Sie die Kundenansicht, um Cocktails zu bestellen.
3. Melden Sie sich als Barkeeper an, um Cocktails zu verwalten und Bestellungen zu bearbeiten.

## Ordnerstruktur

```plaintext
.
├── backend
│   ├── db.js
│   ├── routes.js
│   ├── server.js
│   └── uploads
├── fillDatabase.js
├── insertDummyOrders.js
├── package.json
├── package-lock.json
├── public
│   ├── barkeeper.html
│   ├── css
│   │   └── styles.css
│   ├── customer.html
│   ├── favicon.ico
│   ├── js
│   │   ├── api.js
│   │   ├── barkeeper.js
│   │   ├── customer.js
│   │   └── dom.js
│   └── uploads -> ../uploads
└── uploads
```

## Technologien

Frontend: 
- HTML, 
- CSS, 
- JavaScript

Backend: 
- Node.js
- Express.js
- WebSockets

Datenbank: 
- CouchDB

Styling: 
- Bootstrap
- Bootswatch themes

## Autoren
Akin: Hauptentwickler

## Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe die LICENSE-Datei für Details.