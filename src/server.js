const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Route all pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/gallery.html'));
});

app.get('/painting/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/painting.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

app.get('/exhibition', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/exhibition.html'));
});

app.listen(PORT, () => {
  console.log(`🕯️  Gothic Gallery running at http://localhost:${PORT}`);
});
