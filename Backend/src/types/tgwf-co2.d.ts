declare module "@tgwf/co2" {
  export interface SegmentedEstimate {
    total: number;
    rating: string;
    totalOperationalCO2e: number;
    totalEmbodiedCO2e: number;
    dataCenterCO2e: number;
    networkCO2e: number;
    consumerDeviceCO2e: number;
  }

  export class co2 {
    constructor(options: {
      model: "swd";
      version: 4;
      rating: true;
      results: "segment";
    });
    perByte(bytes: number, green?: boolean): SegmentedEstimate;
  }
}
