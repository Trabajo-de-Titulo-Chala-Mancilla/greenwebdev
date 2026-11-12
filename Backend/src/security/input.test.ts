import { describe, expect, it } from "vitest";
import { selectInternalLinks } from "../measure/links.js";
import { analysisRequestSchema, normalizeUrl } from "../schemas.js";
import { classifyHost, isPublicIp } from "./hostPolicy.js";

describe("normalizeUrl", () => {
  it("agrega https a un dominio sin protocolo", () => {
    expect(normalizeUrl(" wikipedia.org ")?.href).toBe("https://wikipedia.org/");
  });

  it.each(["ftp://ejemplo.cl", "file:///etc/passwd", "javascript:alert(1)", "https://u:p@ejemplo.cl", "nota valida"])(
    "rechaza %s",
    (input) => {
      expect(normalizeUrl(input)).toBeNull();
    },
  );
});

describe("analysisRequestSchema", () => {
  it.each([0, -5, 1.5, "1000"])("rechaza visitas = %s", (monthlyVisits) => {
    expect(analysisRequestSchema.safeParse({ url: "ejemplo.cl", monthlyVisits }).success).toBe(false);
  });
});

describe("política de hosts", () => {
  it.each([
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254",
    "0.0.0.0", "::1", "fc00::1", "fe80::1", "::ffff:127.0.0.1",
  ])("bloquea %s", (ip) => {
    expect(isPublicIp(ip)).toBe(false);
  });

  it.each(["8.8.8.8", "2001:4860:4860::8888"])("permite %s", (ip) => {
    expect(isPublicIp(ip)).toBe(true);
  });

  it("marca como privado un dominio si alguna dirección lo es", async () => {
    await expect(classifyHost("mixto.test", async () => ["8.8.8.8", "10.0.0.1"])).resolves.toBe("private");
  });

  it("distingue un dominio inexistente", async () => {
    const failing = async () => {
      throw new Error("ENOTFOUND");
    };
    await expect(classifyHost("no-existe.test", failing)).resolves.toBe("unresolved");
  });

  it("reconoce IPv6 entre corchetes", async () => {
    await expect(classifyHost("[::1]")).resolves.toBe("private");
  });
});

describe("selectInternalLinks", () => {
  const base = "https://www.ejemplo.cl/";

  it("conserva el orden y aplica el límite", () => {
    expect(selectInternalLinks(["/a", "/b", "/c"], base, 2)).toEqual([
      "https://www.ejemplo.cl/a",
      "https://www.ejemplo.cl/b",
    ]);
  });

  it("descarta externos, archivos, duplicados y la propia portada", () => {
    const hrefs = [
      "https://otro.cl/x", "mailto:a@ejemplo.cl", "/manual.PDF", "/", "#top",
      "/nosotros", "/nosotros/", "/nosotros#equipo", "/nosotros?utm=1",
    ];
    expect(selectInternalLinks(hrefs, base, 10)).toEqual(["https://www.ejemplo.cl/nosotros"]);
  });

  it("trata www y el dominio raíz como el mismo sitio", () => {
    expect(selectInternalLinks(["https://ejemplo.cl/a"], base, 10)).toEqual(["https://ejemplo.cl/a"]);
  });
});
