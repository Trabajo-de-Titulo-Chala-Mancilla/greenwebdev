const express = require('express');
const router = express.Router();
const { calcularHuella } = require('../controllers/calculatorController');

router.post('/calculate', (req, res) => {
  res.json({ message: 'Ruta /api/calculate funcionando!' });
});

module.exports = router;
