const { co2 } = require("@tgwf/co2");
const swd = new co2();

function calculateCO2FromBytes(bytes){
  return swd.perByte(bytes);
}

module.exports = { calculateCO2FromBytes };

