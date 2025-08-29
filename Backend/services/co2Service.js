// backend/services/co2Service.js
const { co2 } = require("@tgwf/co2");

const estimator = new co2();

function calcularHuellaCarbono(bytes) {
  // bytes = tamaño en bytes de los datos transferidos (ejemplo: HTML, imágenes, etc.)
  return estimator.perByte(bytes);
}

module.exports = { calcularHuellaCarbono };
