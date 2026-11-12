# Green Web Development

Prototipo de calculadora de huella de carbono para sitios web, desarrollado como trabajo de título en la UTEM junto a Grow Better Agency. Mide un sitio real, estima sus emisiones y genera un reporte PDF.

## Cómo funciona

1. El usuario ingresa un sitio y sus visitas mensuales estimadas.
2. El backend abre la portada y hasta 10 páginas internas enlazadas en Chromium, con caché vacía, y suma los bytes transferidos por red.
3. CO2.js aplica el modelo Sustainable Web Design v4 a esos bytes.
4. El frontend muestra los resultados y genera el PDF en el navegador con `@react-pdf/renderer`.

No hay base de datos: cada análisis vive solo en la sesión del navegador.

## Stack

| Parte | Tecnologías |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Chart.js, @react-pdf/renderer |
| Backend | Node.js, TypeScript, Fastify, Zod, Playwright, @tgwf/co2 |
| Pruebas | Vitest, con Chromium real en la prueba de medición |
| Despliegue | Docker Compose, Nginx |

## Ejecutar

Con Docker (abre http://localhost:5173):

```bash
docker compose up --build
```

En desarrollo, se requiere Node.js 22.18 o superior:

```bash
# Terminal 1
cd Backend
npm install
npx playwright install chromium
npm run dev

# Terminal 2
cd Frontend
npm install
npm run dev
```

## Verificar

```bash
cd Backend && npm test && npm run typecheck
cd Frontend && npm run lint && npm run build
```

## API

`POST /api/analyses`

```json
{ "url": "www.ejemplo.cl", "monthlyVisits": 10000 }
```

Responde el análisis completo (contrato en `Backend/src/types.ts`). Los errores tienen la forma `{ "code": "...", "error": "mensaje" }`:

| Estado | Código | Causa |
|---|---|---|
| 400 | `INVALID_REQUEST` | URL o visitas inválidas |
| 400 | `BLOCKED_HOST` | El sitio apunta a una dirección privada |
| 422 | `SITE_UNREACHABLE` | La portada no cargó |
| 429 | `RATE_LIMITED` | Demasiados análisis en un minuto |

`GET /api/health` indica si el servicio está activo.

## Metodología

- **Peso:** bytes comprimidos transferidos por red en una primera visita, incluidos los subrecursos.
- **Emisiones por visita:** `perByte` de CO2.js con SWD v4 y la intensidad promedio mundial de la red. El valor del sitio es el promedio simple de las páginas medidas.
- **Uso y producción:** uso corresponde a las emisiones operacionales del modelo y producción a las incorporadas (*embodied*) en centros de datos, redes y dispositivos.
- **Hosting verde:** se consulta a The Green Web Foundation. Si es verde, se descuenta la operación del centro de datos. Si la consulta falla, se calcula como no verde y el reporte lo indica.
- **Calificación:** escala A+ a F de SWD v4.
- **Proyección a 12 meses:** emisión por visita × visitas mensuales × 12.
- **Escenarios a 4 años:** tráfico +10 % anual, con peso estable, +15 % o −15 % anual.
- **Equivalencias:** factores de la [calculadora de la EPA](https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references): 393 g CO2e por milla en automóvil a gasolina, 12,4 g por carga de smartphone y 60 kg por árbol urbano creciendo 10 años.

## Limitaciones

- Es una estimación basada en promedios del modelo, no una medición directa de consumo eléctrico.
- La proyección depende de las visitas ingresadas y no considera el tráfico real de cada página.
- No se mide el contenido que carga al desplazar la página ni las visitas repetidas con caché.
- El alcance actual cubre sitios web. Las campañas de email marketing y publicaciones en redes sociales del anteproyecto no están implementadas.

## Seguridad

El backend abre URLs ingresadas por usuarios, por lo que:

- Rechaza direcciones privadas, de loopback y de metadatos en la navegación, las redirecciones y los subrecursos.
- Limita los análisis por IP y las páginas simultáneas.
- En Docker ejecuta Chromium con un usuario sin privilegios y el backend no se publica fuera de la red interna.

## Variables de entorno del backend

Todas son opcionales. Ver los valores por defecto en `Backend/src/config.ts`.

`PORT`, `CORS_ORIGIN`, `TRUST_PROXY`, `RATE_LIMIT_PER_MINUTE`, `MEASURE_CONCURRENCY`, `MAX_LINKED_PAGES`, `NAVIGATION_TIMEOUT_MS`, `NETWORK_IDLE_TIMEOUT_MS`, `ALLOW_PRIVATE_HOSTS`
