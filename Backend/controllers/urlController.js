const axios = require("axios");
const { co2 } = require("@tgwf/co2"); 

exports.calculateUrlCO2 = async (req, res) => {
  try {
    // *** CAMBIO 1: Eliminar el valor por defecto '10000' ***
    // Ahora 'visitas' vendrá directamente del body que envía el frontend.
    const { url, visitas } = req.body;

    // *** CAMBIO 2: Añadir 'visitas' a la validación ***
    if (!url || !visitas || visitas <= 0) {
      return res.status(400).json({ error: "Debe proporcionar una URL y un número de visitas válido." });
    }

    // === OBTENER EL PESO DEL SITIO (en bytes) ===
    let bytes = 0;
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      bytes = Buffer.byteLength(response.data);
    } catch (err) {
      console.warn("No se pudo obtener el tamaño exacto del sitio, usando valor estimado.");
      bytes = 500000; // 500 KB por defecto
    }

    // === CALCULAR EMISIONES usando co2.js ===
    let co2_por_byte = 0.0000002; // promedio base g/byte
    let co2_por_visita_g = bytes * co2_por_byte;
    
    // *** CAMBIO 3: 'visitas' ahora viene del req.body ***
    // (Este cálculo ya era correcto, pero ahora usa la variable sin valor por defecto)
    let co2_total_g = co2_por_visita_g * visitas;

    // === Generar datos mensuales (12 meses) ===
    const monthly = [];
    for (let i = 0; i < 12; i++) {
      const factor = 0.85 + Math.random() * 0.3; // variación 15%
      // *** CAMBIO 4: 'visitas' se usa aquí ***
      monthly.push(Number((co2_por_visita_g * visitas * factor).toFixed(2)));
    }

    // === Datos simulados de páginas ===
    // *** CAMBIO 5: 'visitas' se usa aquí ***
    const pages = [
      { path: "/index", g: co2_por_visita_g * 0.8, visits: visitas / 3 },
      { path: "/about", g: co2_por_visita_g * 0.9, visits: visitas / 4 },
      { path: "/contact", g: co2_por_visita_g, visits: visitas / 6 },
      { path: "/blog", g: co2_por_visita_g * 1.2, visits: visitas / 5 },
    ];

    // === Estructura de respuesta ===
    return res.json({
      url,
      bytes,
      co2_por_visita_g: Number(co2_por_visita_g.toFixed(3)),
      co2_total_g: Number(co2_total_g.toFixed(2)),
      monthly,
      pages,
      rank: { pos: 1335, total: 1506 }, // (Ranking simulado)
    });
  } catch (error) {
    console.error("Error en calculateUrlCO2:", error);
    res.status(500).json({ error: "Error al calcular huella de carbono del sitio web." });
  }
};
