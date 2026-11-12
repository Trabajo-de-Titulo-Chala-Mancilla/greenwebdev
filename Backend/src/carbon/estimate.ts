import { co2 } from "@tgwf/co2";

const model = new co2({ model: "swd", version: 4, rating: true, results: "segment" });

export interface Estimate {
  totalGrams: number;
  rating: string;
  /** Operación de centros de datos, redes y dispositivos. */
  useGrams: number;
  /** Energía incorporada en fabricar ese hardware (embodied en SWD v4). */
  productionGrams: number;
  dataCenterGrams: number;
  networkGrams: number;
  userDeviceGrams: number;
}

export function estimate(bytes: number, greenHosting: boolean): Estimate {
  const result = model.perByte(bytes, greenHosting);
  // El total ya descuenta el hosting verde, pero los segmentos de co2.js no.
  // Se resta sobre el centro de datos para que las partes sumen el total.
  const hostingDiscount =
    result.dataCenterCO2e + result.networkCO2e + result.consumerDeviceCO2e - result.total;

  return {
    totalGrams: result.total,
    rating: result.rating,
    useGrams: result.total - result.totalEmbodiedCO2e,
    productionGrams: result.totalEmbodiedCO2e,
    dataCenterGrams: result.dataCenterCO2e - hostingDiscount,
    networkGrams: result.networkCO2e,
    userDeviceGrams: result.consumerDeviceCO2e,
  };
}
