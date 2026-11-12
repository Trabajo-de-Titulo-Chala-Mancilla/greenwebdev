import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = await buildApp();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

await app.listen({ port: config.port, host: "0.0.0.0" });
