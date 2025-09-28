const { calculateCO2FromBytes } = require("../services/co2Service");

exports.calculateEmail = (req, res) => {
  try {
    const { asunto, cuerpo, adjuntos = [] } = req.body;

    // calcular tamaño total en bytes
    let totalBytes = Buffer.byteLength(asunto + cuerpo, "utf8");

    adjuntos.forEach(file => {
      totalBytes += file.bytes || 0;
    });

    const grams = calculateCO2FromBytes(totalBytes);

    res.json({
      total_bytes: totalBytes,
      co2_por_envio_g: grams,
      co2_por_envio_kg: grams / 1000
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular huella del email" });
  }
};
