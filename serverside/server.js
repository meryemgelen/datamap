const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

// PostgreSQL bağlantı bilgileri
const pool = new Pool({
  user: 'postgres', // PostgreSQL kullanıcı adı
  host: 'localhost', // PostgreSQL sunucu adresi
  database: 'map_data', // Veritabanı adı
  password: 'meri', // PostgreSQL şifresi
  port: 5432, // PostgreSQL portu
});

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Tüm işaretçileri al
app.get('/locations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations');
    res.json(result.rows);
  } catch (err) {
    console.error('Veritabanı hatası:', err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Yeni bir işaretçi ekle
app.post('/locations', async (req, res) => {
  const { lat, lng, note } = req.body;

  if (lat && lng) {
    try {
      await pool.query('INSERT INTO locations (lat, lng, note) VALUES ($1, $2, $3)', [lat, lng, note]);
      res.status(201).json({ message: 'İşaretçi başarıyla eklendi.' });
    } catch (err) {
      console.error('Veritabanı hatası:', err);
      res.status(500).json({ error: 'Veritabanı hatası' });
    }
  } else {
    res.status(400).json({ error: 'Lat ve Lng gereklidir.' });
  }
});

// İşaretçiyi güncelle
app.put('/locations', async (req, res) => {
  const { lat, lng, note } = req.body;

  if (lat && lng) {
    try {
      await pool.query('UPDATE locations SET note = $1 WHERE lat = $2 AND lng = $3', [note, lat, lng]);
      res.json({ message: 'İşaretçi başarıyla güncellendi.' });
    } catch (err) {
      console.error('Veritabanı hatası:', err);
      res.status(500).json({ error: 'Veritabanı hatası' });
    }
  } else {
    res.status(400).json({ error: 'Lat ve Lng gereklidir.' });
  }
});

// İşaretçiyi sil
app.delete('/locations', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    await pool.query('DELETE FROM locations WHERE lat = $1 AND lng = $2', [lat, lng]);
    res.json({ message: 'İşaretçi başarıyla silindi.' });
  } catch (err) {
    console.error('Veritabanı hatası:', err);
    res.status(500).json({ error: 'Veritabanı hatası' });
  }
});

// Test bağlantısı
app.get('/test-db', (req, res) => {
  res.send('API bağlantısı başarılı!');
});

// Sunucu başlatma
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
