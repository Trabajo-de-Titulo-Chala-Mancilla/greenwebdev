const express = require("express");
const cors = require("cors");
const path = require("path");


const urlRoutes = require("./routes/url");
const dashboardRoutes = require("./routes/dashboard");
const reportRoutes = require("./routes/report");

const app = express();
app.use(cors());            
app.use(express.json({ limit: "15mb" }));   
app.use(express.urlencoded({ extended: true })); 


//app.use(express.static(path.join(__dirname, "public")));


app.use("/calculate/url", urlRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/report", reportRoutes);

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
