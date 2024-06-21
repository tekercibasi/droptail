const express = require('express'); // Importiert das Express-Framework
const router = express.Router(); // Erstellt einen Router
const multer = require('multer'); // Importiert das Multer-Modul für Dateiuploads
const path = require('path'); // Importiert das Path-Modul von Node.js für Dateipfade
const fs = require('fs'); // Importiert das Filesystem-Modul von Node.js
const { dbs } = require('./db'); // Importiert die Datenbankverbindungen
const WebSocket = require('ws'); // Importiert das WebSocket-Modul

console.log('Setting up file storage with Multer...'); // Log-Anweisung zur Überprüfung

// Setzt den Speicherort und Dateinamen für hochgeladene Dateien
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads'); // Pfad zum Upload-Verzeichnis
    if (!fs.existsSync(uploadPath)) {
      console.log(`Creating upload directory at ${uploadPath}`); // Log-Anweisung zur Überprüfung
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Benennt die Datei mit dem aktuellen Zeitstempel um
  }
});
const upload = multer({ storage }); // Initialisiert Multer mit dem definierten Speicherort

console.log('Setting up database connections...'); // Log-Anweisung zur Überprüfung

// Extrahiert die spezifischen Datenbankverbindungen aus dem dbs-Array
const [cocktailsDb, ingredientsDb, ordersDb] = dbs; // Verwendet die Datenbanken

// Route zum Abrufen aller Cocktails
router.get('/cocktails', async (req, res) => {
  try {
    const response = await cocktailsDb.list({ include_docs: true }); // Listet alle Dokumente in der Cocktails-Datenbank
    const cocktails = response.rows.map(row => row.doc).filter(doc => doc.type === 'cocktail'); // Filtert die Cocktails
    res.json(cocktails); // Sendet die Cocktails als JSON-Antwort
  } catch (error) {
    console.error('Error fetching cocktails:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Abrufen eines einzelnen Cocktails nach ID
router.get('/cocktails/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const cocktail = await cocktailsDb.get(id); // Holt den Cocktail mit der angegebenen ID
    if (cocktail.type === 'cocktail') {
      res.json(cocktail); // Sendet den Cocktail als JSON-Antwort
    } else {
      res.status(404).json({ error: 'Cocktail not found' });
    }
  } catch (error) {
    console.error('Error fetching cocktail:', error);
    res.status(404).json({ error: 'Cocktail not found' });
  }
});

// Route zum Erstellen eines neuen Cocktails
router.post('/cocktails', upload.single('image'), async (req, res) => {
  const { title, description, ingredients, recipe } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  if (!title || !description || !ingredients || !recipe) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await cocktailsDb.insert({ type: 'cocktail', title, description, ingredients, recipe, image, active: true });
    req.app.locals.broadcast({ type: 'cocktail_created', cocktail: result }); // Sendet eine WebSocket-Nachricht
    res.status(201).json({ message: 'Cocktail created' });
  } catch (error) {
    console.error('Error creating cocktail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Aktualisieren eines bestehenden Cocktails
router.put('/cocktails/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, ingredients, recipe, _rev } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

  if (!title || !description || !ingredients || !recipe) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const cocktail = await cocktailsDb.get(id); // Holt den Cocktail mit der angegebenen ID
    cocktail.type = 'cocktail';
    cocktail.title = title;
    cocktail.description = description;
    cocktail.ingredients = ingredients;
    cocktail.recipe = recipe;
    cocktail.image = image;
    cocktail._rev = _rev;
    const result = await cocktailsDb.insert(cocktail);
    req.app.locals.broadcast({ type: 'cocktail_updated', cocktail: result }); // Sendet eine WebSocket-Nachricht
    res.json({ message: 'Cocktail updated' });
  } catch (error) {
    console.error('Error updating cocktail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Löschen eines Cocktails
router.delete('/cocktails/:id', async (req, res) => {
  const { id } = req.params;
  const { rev } = req.query;
  try {
    await cocktailsDb.destroy(id, rev); // Löscht den Cocktail mit der angegebenen ID und Revision
    req.app.locals.broadcast({ type: 'cocktail_deleted', id }); // Sendet eine WebSocket-Nachricht
    res.json({ message: 'Cocktail deleted' });
  } catch (error) {
    console.error('Error deleting cocktail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Abrufen aller Bestellungen
router.get('/orders', async (req, res) => {
  try {
    const response = await ordersDb.list({ include_docs: true }); // Listet alle Dokumente in der Bestellungen-Datenbank
    const orders = response.rows.map(row => row.doc).filter(doc => doc.type === 'order'); // Filtert die Bestellungen
    res.json(orders); // Sendet die Bestellungen als JSON-Antwort
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Erstellen einer neuen Bestellung
router.post('/orders', async (req, res) => {
  const { cocktailId, customizations } = req.body;
  const orderId = `order${Math.floor(Math.random() * 10000)}`;
  try {
    const result = await ordersDb.insert({ _id: orderId, type: 'order', cocktailId, customizations, status: 'pending' });
    req.app.locals.broadcast({ type: 'order_created', order: result }); // Sendet eine WebSocket-Nachricht
    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route zum Aktualisieren des Status einer Bestellung
router.put('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const wss = req.app.locals.wss; // Holt den WebSocket-Server

  try {
    const order = await ordersDb.get(id); // Holt die Bestellung mit der angegebenen ID
    order.status = status;
    const result = await ordersDb.insert(order);

    // Broadcast the updated order to all connected WebSocket clients
    const updatedOrder = { id: order._id, status: order.status, customizations: order.customizations, cocktailId: order.cocktailId };
    req.app.locals.broadcast({ type: 'order_updated', order: updatedOrder }); // Sendet eine WebSocket-Nachricht

    res.json({ message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; // Exportiert den Router
