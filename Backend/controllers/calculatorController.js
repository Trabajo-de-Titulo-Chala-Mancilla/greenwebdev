const db = require('../config/db');
const { calcularCO2 } = require('../services/co2Service');

const calcularHuella = async (req, res) => {
  try {
    const { url, bytesPerPage, monthlyVisits, greenHost } = req.body;

    const { gCo2PerVisit, totalCo2PerYear } = calcularCO2({
      bytesPerPage,
      monthlyVisits,
      greenHost
    });

    await db.execute(
      `INSERT INTO results (url, bytes_per_page, monthly_visits, green_host, g_co2_per_visit, total_co2_per_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [url, bytesPerPage, monthlyVisits, greenHost, gCo2PerVisit, totalCo2PerYear]
    );

    res.json({
      url,
      gCo2PerVisit,
      totalCo2PerYear
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en el cálculo");
  }
};

module.exports = { calcularHuella };
