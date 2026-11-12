import { describe, expect, it } from "vitest";
import { estimate } from "./estimate.js";
import { equivalences, scenarios } from "./projections.js";

const ONE_GB = 1_000_000_000;
const GLOBAL_GRID_G_PER_KWH = 494;

describe("estimate (SWD v4)", () => {
  it("aplica las intensidades publicadas del modelo a 1 GB", () => {
    const useKwh = 0.055 + 0.059 + 0.08;
    const productionKwh = 0.012 + 0.013 + 0.081;
    const result = estimate(ONE_GB, false);

    expect(result.useGrams).toBeCloseTo(useKwh * GLOBAL_GRID_G_PER_KWH, 0);
    expect(result.productionGrams).toBeCloseTo(productionKwh * GLOBAL_GRID_G_PER_KWH, 0);
  });

  it.each([false, true])("uso + producción y sistema suman el total (hosting verde: %s)", (green) => {
    const result = estimate(2_500_000, green);

    expect(result.useGrams + result.productionGrams).toBeCloseTo(result.totalGrams, 9);
    expect(result.dataCenterGrams + result.networkGrams + result.userDeviceGrams).toBeCloseTo(result.totalGrams, 9);
  });

  it("el hosting verde reduce solo la operación del centro de datos", () => {
    const standard = estimate(ONE_GB, false);
    const green = estimate(ONE_GB, true);

    expect(green.totalGrams).toBeLessThan(standard.totalGrams);
    expect(green.productionGrams).toBeCloseTo(standard.productionGrams, 9);
    expect(green.networkGrams).toBeCloseTo(standard.networkGrams, 9);
  });

  it("califica mejor a una página liviana que a una pesada", () => {
    expect(estimate(100_000, false).rating).toBe("A+");
    expect(estimate(20_000_000, false).rating).toBe("F");
  });
});

describe("proyecciones", () => {
  it("convierte con los factores EPA", () => {
    const result = equivalences(60);

    expect(result.urbanTrees10Years).toBe(1);
    expect(result.smartphones).toBeCloseTo(60_000 / 12.4, 6);
    expect(result.carKm).toBeCloseTo((60_000 / 393) * 1.609344, 6);
  });

  it("compone los escenarios a 4 años", () => {
    const byId = Object.fromEntries(scenarios(100).map((s) => [s.id, s.annualKg]));

    expect(byId.traffic).toHaveLength(5);
    expect(byId.traffic?.[0]).toBe(100);
    expect(byId.traffic?.[4]).toBeCloseTo(146.41, 2);
    expect(byId.heavier?.[4]).toBeCloseTo(100 * (1.1 * 1.15) ** 4, 6);
    expect(byId.lighter?.[4]).toBeCloseTo(100 * (1.1 * 0.85) ** 4, 6);
  });
});
