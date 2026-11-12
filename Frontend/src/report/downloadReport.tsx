import { Font, pdf } from "@react-pdf/renderer";
import regular from "@fontsource/montserrat/files/montserrat-latin-400-normal.woff?url";
import bold from "@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url";
import type { AnalysisResult } from "../types";
import ReportDocument, { FONT_FAMILY } from "./ReportDocument";

Font.register({
  family: FONT_FAMILY,
  fonts: [
    { src: regular, fontWeight: 400 },
    { src: bold, fontWeight: 700 },
  ],
});
// La separación silábica por defecto es para inglés y cortaría mal el español.
Font.registerHyphenationCallback((word) => [word]);

export async function downloadReport(result: AnalysisResult): Promise<void> {
  const blob = await pdf(<ReportDocument result={result} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `reporte-co2-${result.hostname}-${result.analyzedAt.slice(0, 10)}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
