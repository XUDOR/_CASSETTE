// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { Storage } = require('@google-cloud/storage'); // Add this line

app.use(cors());
app.use(express.static(__dirname));

// Serve static files
app.use('/library', express.static(path.join(__dirname, 'library')));

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = 'ip-cassette';

// API to list MP3 files from Google Cloud Storage
app.get('/api/library', async (req, res) => {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({ prefix: 'cassette1/library/' });
    const mp3Files = files
      .filter(file => file.name.endsWith('.mp3'))
      .map(file => file.name.replace('cassette1/library/', ''));
    res.json(mp3Files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Unable to list files' });
  }
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
