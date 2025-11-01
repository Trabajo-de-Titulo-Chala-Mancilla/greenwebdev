const PDFDocument = require("pdfkit");

exports.generateReportPDF = async (req, res) => {
  try {
    const { domain, summary, monthly, pages, charts } = req.body;

    if (!domain || !summary || !charts) {
      return res.status(400).json({ error: "Datos insuficientes para generar el PDF." });
    }

    // 🔹 Cabeceras de respuesta
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=carbon_report_${domain}.pdf`
    );

    // 🔹 Crear documento PDF
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // === PORTADA ===
    doc
      .fontSize(24)
      .fillColor("#0ea5a4")
      .text("Green Web Development: Cálculadora Digital de Carbono", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(20)
      .fillColor("#475569")
      .text(`Fecha del reporte: ${new Date().toLocaleDateString("es-CL")}`, {
        align: "center",
      })
      .moveDown(2);

    // Línea divisoria
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor("#94a3b8")
      .stroke();

    doc.moveDown(2);

    // === RESUMEN PRINCIPAL ===
    doc
      .fontSize(16)
      .fillColor("#0f172a")
      .text("Resumen de emisiones", { underline: true })
      .moveDown(1);

    const totalKg = (summary.total_12m_g / 1000).toFixed(2);
    doc.fontSize(12).fillColor("#334155");
    doc.text(`• Dominio analizado: ${domain}`);
    doc.text(`• Emisiones promedio por visita: ${summary.per_visit_g.toFixed(3)} g CO₂e`);
    doc.text(`• Emisiones totales (últimos 12 meses): ${totalKg} kg CO₂e`);
    doc.moveDown(1.5);

    // === GRÁFICOS ===
    const addChart = (title, base64Data, fit = [500, 200]) => {
      try {
        if (base64Data) {
          doc
            .fontSize(14)
            .fillColor("#0ea5a4")
            .text(title)
            .moveDown(0.5);

          const imgData = base64Data.split(",")[1];
          const imgBuffer = Buffer.from(imgData, "base64");
          doc.image(imgBuffer, { fit, align: "center", valign: "center" });
          doc.moveDown(1.2);
        }
      } catch (e) {
        console.warn(`⚠️ Error al renderizar imagen "${title}":`, e.message);
      }
    };

    addChart("Emisiones mensuales (últimos 12 meses)", charts.monthlyChart);
    doc.moveDown(1.5);
    addChart("Escenarios proyectados de emisiones", charts.scenariosChart);
    // === TABLA DE PÁGINAS ===
    if (pages && pages.length) {
      doc.addPage();
      addChart("Distribución Uso vs Producción", charts.donutChart, [200, 200]);
      doc.fontSize(16).fillColor("#0f172a").text("Detalle por páginas", {
        underline: true,
      });
      doc.moveDown(1);

      const col1 = 60;
      const col2 = 300;
      const col3 = 430;
      let y = doc.y;

      // Encabezados
      doc.fontSize(12).fillColor("#0ea5a4");
      doc.text("Página", col1, y);
      doc.text("CO₂ / visita (g)", col2, y);
      doc.text("Visitas/mes", col3, y);

      y += 18;
      doc.fontSize(11).fillColor("#334155");

      pages.slice(0, 15).forEach((p) => {
        doc.text(p.path || "-", col1, y);
        doc.text((p.g || 0).toFixed(3), col2, y);
        doc.text(p.visits ? p.visits.toLocaleString("es-CL") : "-", col3, y);
        y += 16;
      });

      doc.moveDown(2);
    }

    // === COMPARACIONES ===
    doc.addPage();
    doc
      .fontSize(16)
      .fillColor("#0f172a")
      .text("Comparaciones de equivalencia", { underline: true })
      .moveDown(1);

    const eqCars = (totalKg / 0.121).toFixed(1);
    const eqPhones = Math.round(totalKg * 120);
    const eqTrees = (totalKg / 25).toFixed(1);

    doc.fontSize(12).fillColor("#334155");
    doc.text(`• Equivale a conducir ${eqCars} km en un automóvil a gasolina.`);
    doc.text(`• Equivale a ${eqPhones} smartphones cargados completamente.`);
    doc.text(`• Equivale a la absorción anual de ${eqTrees} árboles.`);
    doc.moveDown(2);

    // === CONCLUSIÓN ===
    doc
      .fontSize(16)
      .fillColor("#0f172a")
      .text("Conclusiones", { underline: true })
      .moveDown(1);

    doc.fontSize(12).fillColor("#334155");
    doc.text(
      "Este reporte ha sido generado automáticamente utilizando métricas estimadas de huella de carbono digital. Los valores pueden variar dependiendo del tráfico mensual, peso medio de recursos del sitio y su optimización energética."
    );

    doc.moveDown(2);

    // === PIE DE PÁGINA ===
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text("© 2025 Grow Better Agency ", {
        align: "center",
      });

    // ✅ Finalizar
    doc.end();
  } catch (err) {
    console.error("❌ Error generando PDF:", err);
    res.status(500).json({ error: "Error al generar el PDF" });
  }
};
