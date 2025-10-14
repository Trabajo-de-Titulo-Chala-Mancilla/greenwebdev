const { calculateCO2FromBytes } = require("../services/co2Service");


const visitasSimuladas = 10000;
const archivosSimulados = [
  { name: "promo.pdf", bytes: 102400 },
  { name: "imagen.jpg", bytes: 204800 }
];
const emailsSimulados = [
  { asunto: "Newsletter", cuerpo: "Contenido de prueba", adjuntos: [{ name: "adj.pdf", bytes: 51200 }] }
];

exports.getDashboardData = (req, res) => {
  try {
    
    const co2PorVisita = calculateCO2FromBytes(150000); 
    const emisionesUso = {
      visitas: visitasSimuladas,
      co2_total_g: co2PorVisita * visitasSimuladas,
      co2_total_kg: (co2PorVisita * visitasSimuladas) / 1000
    };

    
    const archivos = archivosSimulados.map(f => {
      const g = calculateCO2FromBytes(f.bytes);
      return { nombre: f.name, bytes: f.bytes, co2_g: g, co2_kg: g / 1000 };
    });

    
    const emails = emailsSimulados.map(e => {
      let totalBytes = Buffer.byteLength(e.asunto + e.cuerpo, "utf8");
      e.adjuntos.forEach(a => { totalBytes += a.bytes || 0; });
      const g = calculateCO2FromBytes(totalBytes);
      return { asunto: e.asunto, total_bytes: totalBytes, co2_g: g, co2_kg: g / 1000 };
    });

    res.json({
      emisiones_uso: emisionesUso,
      emisiones_produccion: {
        archivos,
        emails
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al generar datos del dashboard" });
  }
};
