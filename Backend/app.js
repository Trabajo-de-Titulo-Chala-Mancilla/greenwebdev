const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const calculatorRoutes = require('./routes/calculator');
app.use('/api', calculatorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
