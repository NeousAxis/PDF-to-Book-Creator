const express = require('express');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const axios = require('axios');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json({ limit: '2mb' }));

// ---- Global request logger (pour voir *quelque chose* dans Render Logs)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ---- Routes de diagnostic
app.get('/__ping', (_req, res) => {
  console.log('PING OK');
  res.status(200).send('ok');
});
app.post('/__echo', (req, res) => {
  console.log('ECHO BODY:', req.body);
  res.status(200).json({ received: req.body || null });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    try {
        const pdfDoc = await PDFDocument.load(await fs.readFile(req.file.path));
        res.json({
            message: 'File uploaded and processed successfully.',
            filename: req.file.filename,
            pages: pdfDoc.getPageCount()
        });
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).send('Error processing PDF.');
    }
});

app.post('/api/generate', async (req, res) => {
    console.log("Request received on /api/generate");
    const { pdf, cover, text, author, title } = req.body;
    if (!pdf || !cover || !text || !author || !title) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const pdfPath = path.join(__dirname, 'uploads', pdf);
    const coverPath = path.join(__dirname, 'public', 'covers', `${cover}.png`);
    const outputPath = path.join(__dirname, 'public', 'temp', `book_${Date.now()}.pdf`);

    try {
        const command = `
            /opt/homebrew/bin/convert -page A4 \
            ( "${coverPath}" -gravity center -resize 2480x3508^ ) \
            "uploads/${pdf}" \
            -font "Helvetica" -pointsize 70 -draw "gravity center text 0,0 '${title}'" \
            -font "Helvetica" -pointsize 40 -draw "gravity south text 0,100 '${author}'" \
            "${outputPath}"
        `;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).json({ error: 'Failed to generate book.' });
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
            res.json({
                message: 'Book generated successfully!',
                downloadUrl: `/temp/book_${path.basename(outputPath)}`
            });
        });
    } catch (error) {
        console.error('Error generating book:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

// === Cost Breakdown route ===
async function getLuluToken() {
  const basic = Buffer.from(
    `${process.env.LULU_API_KEY}:${process.env.LULU_API_SECRET}`
  ).toString("base64");

  const res = await axios.post(
    "https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token",
    "grant_type=client_credentials",
    {
      headers: {
        "Authorization": `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );
  return res.data.access_token;
}

app.post("/api/cost", async (req, res) => {
  try {
    const { line_items, shipping_address, shipping_option } = req.body;
    if (!line_items || !shipping_address || !shipping_option) {
      console.error("❌ /api/cost missing fields:", { line_items: !!line_items, shipping_address: !!shipping_address, shipping_option: !!shipping_option });
      return res.status(400).json({ error: "Missing required fields" });
    }

    const token = await getLuluToken();

    const resp = await axios.post(
      "https://api.sandbox.lulu.com/print-job-cost-calculations/",
      { line_items, shipping_address, shipping_option },
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    console.log("✅ Lulu cost response:", resp.data);
    res.status(200).json(resp.data);
  } catch (err) {
    const details = err?.response?.data || err?.message || 'unknown error';
    console.error("❌ /api/cost error:", details);
    res.status(500).json({ error: "Cost calculation failed", details });
  }
});

// ---- Global error handler (au cas où)
app.use((err, _req, res, _next) => {
  console.error('❌ Uncaught error:', err?.stack || err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`🚀 Server listening at http://localhost:${port}`);
});