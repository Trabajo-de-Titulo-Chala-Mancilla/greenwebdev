const express = require("express");
const cors = require("cors");
const path = require("path");

// Importar rutas
const urlRoutes = require("./routes/url");
const fileRoutes = require("./routes/file");
const emailRoutes = require("./routes/email");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Middlewares
app.use(cors());            // permite solicitudes cross-origin
app.use(express.json());    // parsea JSON en body
app.use(express.urlencoded({ extended: true })); // parsea form-data

// Servir HTML y assets desde /public
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/calculate/url", urlRoutes);
app.use("/calculate/file", fileRoutes);
app.use("/calculate/email", emailRoutes);
app.use("/dashboard", dashboardRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
