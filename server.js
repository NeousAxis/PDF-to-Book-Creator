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

// Middleware pour JSON et logs
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
    console.log('Received cost calculation request:', JSON.stringify(req.body, null, 2));
    const { pod_package_id, page_count, shipping_address, shipping_option } = req.body;
    
    // Vérifier les paramètres requis
    if (!pod_package_id || !page_count || !shipping_address || !shipping_option) {
      console.error('Missing required parameters:', { pod_package_id, page_count, shipping_address, shipping_option });
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Récupérer le token Lulu
    const clientId = process.env.LULU_CLIENT_ID;
    const clientSecret = process.env.LULU_CLIENT_SECRET;
    const luluApiBase = process.env.LULU_API_BASE || 'https://api.lulu.com/v1';
    
    console.log('Lulu API configuration:', { 
      clientIdExists: !!clientId, 
      clientSecretExists: !!clientSecret, 
      luluApiBase 
    });
    
    if (!clientId || !clientSecret) {
      console.error('Lulu API credentials not configured');
      return res.status(500).json({ error: 'Lulu API credentials not configured' });
    }
    
    // Obtenir le token d'authentification
    console.log('Requesting Lulu authentication token...');
    const tokenUrl = `${luluApiBase}/auth/realms/glasstree/protocol/openid-connect/token`;
    console.log('Token URL:', tokenUrl);
    
    let accessToken;
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      });
      
      console.log('Token response status:', tokenResponse.status);
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Failed to get Lulu token:', errorText);
        return res.status(500).json({ error: 'Failed to authenticate with Lulu API', details: errorText });
      }
      
      const tokenData = await tokenResponse.json();
      console.log('Successfully obtained Lulu token');
      accessToken = tokenData.access_token;
    } catch (tokenError) {
      console.error('Exception during token request:', tokenError);
      return res.status(500).json({ error: 'Exception during Lulu authentication', details: tokenError.message });
    }
    
    // Appeler l'API de calcul de coût
    console.log('Calling Lulu cost calculation API...');
    const costUrl = `${luluApiBase}/print-job-cost-calculations/`;
    console.log('Cost calculation URL:', costUrl);
    
    try {
      const costResponse = await fetch(costUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          pod_package_id,
          page_count,
          shipping_address,
          shipping_option
        })
      });
      
      console.log('Cost calculation response status:', costResponse.status);
      
      if (!costResponse.ok) {
        const errorText = await costResponse.text();
        console.error('Failed to calculate cost:', errorText);
        return res.status(costResponse.status).json({ error: 'Failed to calculate cost with Lulu API', details: errorText });
      }
      
      const costData = await costResponse.json();
      console.log('Successfully calculated cost');
      res.json(costData);
    } catch (costError) {
      console.error('Exception during cost calculation:', costError);
      return res.status(500).json({ error: 'Exception during cost calculation', details: costError.message });
    }
  } catch (error) {
    console.error('Error in cost calculation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Fallback pour React Router - utilisation d'une route simple pour éviter les problèmes avec path-to-regexp
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});