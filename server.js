const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));

// Serve MP3 files from the 'library' directory
app.use('/library', express.static(path.join(__dirname, 'library')));

// API to list MP3 files
app.get('/api/library', (req, res) => {
  const fs = require('fs');
  const libraryPath = path.join(__dirname, 'library');
  fs.readdir(libraryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
    res.json(mp3Files);
  });
});

// Catch-all route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});