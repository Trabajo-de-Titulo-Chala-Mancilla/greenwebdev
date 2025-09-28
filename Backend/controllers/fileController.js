const { calculateCO2FromBytes } = require("../services/co2Service");
const fs = require("fs");

exports.calculateFile = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Debes subir un archivo" });

    const bytes = fs.statSync(req.file.path).size;
    const grams = calculateCO2FromBytes(bytes);

    // eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      filename: req.file.originalname,
      bytes,
      co2_por_envio_g: grams,
      co2_por_envio_kg: grams / 1000
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular huella del archivo" });
  }
};
