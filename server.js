const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(__dirname));
app.use('/library', express.static(path.join(__dirname, 'library')));

app.get('/api/library', async (req, res) => {
  const libraryPath = path.join(__dirname, 'library');
  try {
    const files = await fs.readdir(libraryPath);
    const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');
    res.json(mp3Files);
  } catch (err) {
    console.error('Error scanning directory:', err);
    res.status(500).json({ error: 'Unable to scan directory', details: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});