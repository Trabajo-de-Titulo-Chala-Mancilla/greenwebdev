const { calculateCO2FromBytes } = require("../services/co2Service");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.calculateUrl = async (req, res) => {
  try {
    const { url, visitas = 1 } = req.body;
    if (!url) return res.status(400).json({ error: "Debes enviar 'url'" });

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = buffer.byteLength;
    const grams = calculateCO2FromBytes(bytes);

    res.json({
      url,
      visitas,
      bytes,
      co2_por_visita_g: grams,
      co2_total_g: grams * visitas,
      co2_total_kg: (grams * visitas) / 1000
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular huella del sitio web" });
  }
};
