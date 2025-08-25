// Remplacez TOUTES les lignes require par import
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour JSON
app.use(express.json());

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Routes de test
app.get('/__ping', (req, res) => {
  res.send('pong');
});

app.get('/__echo', (req, res) => {
  const message = req.query.message || 'No message provided';
  res.send(message);
});

// Route API Lulu
app.post('/api/cost', async (req, res) => {
  try {
    // Votre code API Lulu ici...
    res.json({ message: 'API cost calculation' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback pour React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});