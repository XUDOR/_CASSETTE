//server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve MP3 files from the 'library' directory
app.use('/library', express.static(path.join(__dirname, 'library')));

// New endpoint to list MP3 files
app.get('/api/library', (req, res) => {
  const libraryPath = path.join(__dirname, 'library');
  fs.readdir(libraryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
    res.json(mp3Files);
  });
});

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});