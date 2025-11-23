import { Injectable } from "@angular/core";
import { jsPDF } from "jspdf";

type RGB = readonly [number, number, number];

interface Logo {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Injectable({
  providedIn: "root",
})
export class PdfGenerator {
  private doc!: jsPDF;
  private y = 0;
  private readonly pageWidth = 210;
  private readonly contentWidth = 170;
  private readonly pageHeight = 297;
  private readonly margin = 20;

  // Paleta verde profesional y moderna
  private readonly colors = {
    primary: [34, 139, 34] as RGB,        // Verde bosque
    secondary: [46, 125, 50] as RGB,      // Verde oscuro
    accent: [129, 199, 132] as RGB,       // Verde claro
    success: [67, 160, 71] as RGB,        // Verde éxito
    danger: [211, 47, 47] as RGB,         // Rojo para alertas
    text: [33, 33, 33] as RGB,            // Gris muy oscuro
    lightGray: [232, 245, 233] as RGB,    // Verde muy claro
    mediumGray: [165, 214, 167] as RGB,   // Verde grisáceo
    white: [255, 255, 255] as RGB,
    background: [249, 251, 249] as RGB,   // Fondo verde muy sutil
    darkGreen: [27, 94, 32] as RGB,       // Verde muy oscuro
    gold: [255, 193, 7] as RGB,           // Dorado para acentos
  };

  // Cache para imágenes cargadas
  private imageCache: Map<string, string> = new Map();

  generate(planId: string, secciones: any): void {
    this.doc = new jsPDF();
    this.y = 0;

    // Portada con logos
    this.addCover(secciones);

    // Contenido
    this.addIdeaNegocio(secciones.idea);
    this.addObjetivos(secciones.objetivos);
    this.addCostos(secciones.costos, secciones["mano-obra"], secciones["costos-indirectos"]);
    this.addPonEnMarcha(secciones["pon-en-marcha"]);

    // Guardar
    this.doc.save(`plan-negocio-${planId}.pdf`);
  }

  // Método para cargar imágenes como base64 desde assets
  private async loadImage(src: string): Promise<string> {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    }

    try {
      // Construir ruta correcta para assets de Angular
      const imagePath = src;
      const response = await fetch(imagePath);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          this.imageCache.set(src, base64);
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Error loading image from ${src}:`, error);
      return "";
    }
  }

  // Método público para pre-cargar logos antes de generar el PDF
  async preloadLogos(logoSrcs: string[]): Promise<void> {
    const promises = logoSrcs.map(src => this.loadImage(src));
    await Promise.all(promises);
  }

  private addCover(secciones: any): void {
    // Fondo degradado verde más suave
    const gradientSteps = 60;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = this.colors.primary[0] + (this.colors.darkGreen[0] - this.colors.primary[0]) * ratio;
      const g = this.colors.primary[1] + (this.colors.darkGreen[1] - this.colors.primary[1]) * ratio;
      const b = this.colors.primary[2] + (this.colors.darkGreen[2] - this.colors.primary[2]) * ratio;

      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * (this.pageHeight / gradientSteps), this.pageWidth, this.pageHeight / gradientSteps + 1, "F");
    }

    // Diseño decorativo con círculos más artísticos
    this.doc.setFillColor(255, 255, 255, 0.06);
    this.doc.circle(this.pageWidth - 20, 30, 70, "F");
    this.doc.circle(20, this.pageHeight - 30, 60, "F");

    this.doc.setFillColor(255, 255, 255, 0.04);
    this.doc.circle(this.pageWidth - 50, 80, 40, "F");
    this.doc.circle(40, this.pageHeight - 70, 45, "F");
    this.doc.circle(this.pageWidth / 2, 180, 100, "F");

    // Marco decorativo superior
    this.doc.setDrawColor(...this.colors.gold);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.margin - 5, 15, this.contentWidth + 10, 85, "S");

    // Título principal con mejor espaciado
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(42);
    this.doc.setFont("helvetica", "bold");
    const title = "PLAN DE NEGOCIO";
    this.doc.text(title, this.pageWidth / 2, 45, { align: "center" });

    // Línea decorativa con estilo
    this.doc.setDrawColor(...this.colors.gold);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin + 20, 55, this.pageWidth - this.margin - 20, 55);

    this.doc.setLineWidth(0.8);
    this.doc.line(this.margin + 30, 58, this.pageWidth - this.margin - 30, 58);

    // Subtítulo con mejor diseño
    this.doc.setFontSize(22);
    this.doc.setFont("helvetica", "normal");
    const subtitle = secciones.idea?.nombreNegocio || "MIGA";

    // Fondo del subtítulo más elegante
    const subtitleWidth = this.doc.getTextWidth(subtitle);
    this.doc.setFillColor(255, 255, 255, 0.12);
    this.doc.roundedRect(
      (this.pageWidth - subtitleWidth) / 2 - 15,
      67,
      subtitleWidth + 30,
      18,
      4,
      4,
      "F"
    );

    // Borde sutil
    this.doc.setDrawColor(255, 255, 255);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(
      (this.pageWidth - subtitleWidth) / 2 - 15,
      67,
      subtitleWidth + 30,
      18,
      4,
      4,
      "S"
    );

    this.doc.setTextColor(...this.colors.white);
    this.doc.text(subtitle, this.pageWidth / 2, 79, { align: "center" });

    // Logos institucionales con mejor distribución
    this.addCoverLogos();

    // Información adicional con mejor diseño
    this.doc.setFontSize(10);
    this.doc.setTextColor(240, 240, 240);
    this.doc.setFont("helvetica", "normal");

    const fecha = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Marco para la fecha
    this.doc.setFillColor(255, 255, 255, 0.08);
    this.doc.roundedRect(this.pageWidth / 2 - 45, this.pageHeight - 42, 90, 20, 3, 3, "F");

    this.doc.setFontSize(9);
    this.doc.setTextColor(220, 220, 220);
    this.doc.text("Documento generado:", this.pageWidth / 2, this.pageHeight - 35, { align: "center" });

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(fecha, this.pageWidth / 2, this.pageHeight - 27, { align: "center" });

    // Pie de página decorativo mejorado
    this.doc.setDrawColor(...this.colors.gold);
    this.doc.setLineWidth(1);
    this.doc.line(30, this.pageHeight - 15, this.pageWidth - 30, this.pageHeight - 15);

    this.doc.setLineWidth(0.3);
    this.doc.line(40, this.pageHeight - 12, this.pageWidth - 40, this.pageHeight - 12);

    this.doc.addPage();
    this.y = this.margin;
  }

  private addCoverLogos(): void {
    // Mejor distribución para 4 logos
    const logoSize = 35;
    const horizontalSpacing = 55;
    const verticalSpacing = 48;
    const startY = 120;

    const logos: Logo[] = [
      {
        src: "/logo1.png",
        x: this.pageWidth / 2 - horizontalSpacing - logoSize / 2,
        y: startY,
        width: logoSize,
        height: logoSize
      },
      {
        src: "/logo5.jpg",
        x: this.pageWidth / 2 + horizontalSpacing - logoSize / 2,
        y: startY,
        width: logoSize,
        height: logoSize
      },
      {
        src: "/logo6.jpg",
        x: this.pageWidth / 2 - horizontalSpacing - logoSize / 2,
        y: startY + verticalSpacing,
        width: logoSize,
        height: logoSize
      },
      {
        src: "/logo4.png",
        x: this.pageWidth / 2 + horizontalSpacing - logoSize / 2,
        y: startY + verticalSpacing,
        width: logoSize,
        height: logoSize
      },
    ];

    const labels = ["Agencia Asturiana", "MIGA", "ADSIS", "Gobierno de Asturias"];

    logos.forEach((logo, index) => {
      // Sombra suave
      this.doc.setFillColor(0, 0, 0, 0.15);
      this.doc.roundedRect(logo.x + 2, logo.y + 2, logo.width, logo.height, 6, 6, "F");

      // Fondo blanco del logo
      this.doc.setFillColor(255, 255, 255);
      this.doc.roundedRect(logo.x, logo.y, logo.width, logo.height, 6, 6, "F");

      // Borde dorado sutil
      this.doc.setDrawColor(...this.colors.gold);
      this.doc.setLineWidth(1);
      this.doc.roundedRect(logo.x, logo.y, logo.width, logo.height, 6, 6, "S");

      // Intentar cargar imagen desde cache
      const cachedImage = this.imageCache.get(logo.src);
      if (cachedImage) {
        try {
          // Detectar formato de imagen
          const format = logo.src.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG';
          this.doc.addImage(cachedImage, format, logo.x + 3, logo.y + 3, logo.width - 6, logo.height - 6);
        } catch (error) {
          console.error(`Error adding image ${logo.src}:`, error);
          this.drawFallbackIcon(index, logo.x, logo.y, logo.width);
        }
      } else {
        // Dibujar icono si no hay imagen cargada
        this.drawFallbackIcon(index, logo.x, logo.y, logo.width);
      }

      // Etiqueta bajo el logo
      this.doc.setFontSize(8);
      this.doc.setTextColor(240, 240, 240);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(labels[index], logo.x + logo.width / 2, logo.y + logo.width + 7, { align: "center" });
    });
  }

  private drawFallbackIcon(index: number, x: number, y: number, size: number): void {
    // Iconos más elegantes como fallback
    const centerX = x + size / 2;
    const centerY = y + size / 2;

    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setFillColor(...this.colors.primary);

    switch(index) {
      case 0:
        // Estrella
        this.doc.setFontSize(size * 0.6);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text("★", centerX, centerY + size * 0.15, { align: "center" });
        break;
      case 1:
        // Círculo con punto
        this.doc.circle(centerX, centerY, size * 0.25, "S");
        this.doc.circle(centerX, centerY, size * 0.1, "F");
        break;
      case 2:
        // Rombo
        this.doc.setLineWidth(2);
        this.doc.line(centerX, centerY - size * 0.25, centerX + size * 0.25, centerY);
        this.doc.line(centerX + size * 0.25, centerY, centerX, centerY + size * 0.25);
        this.doc.line(centerX, centerY + size * 0.25, centerX - size * 0.25, centerY);
        this.doc.line(centerX - size * 0.25, centerY, centerX, centerY - size * 0.25);
        break;
      case 3:
        // Triángulo
        this.doc.triangle(
          centerX, centerY - size * 0.25,
          centerX - size * 0.25, centerY + size * 0.2,
          centerX + size * 0.25, centerY + size * 0.2,
          "FD"
        );
        break;
    }
  }

  private drawIcon(type: string, x: number, y: number, size: number, color: RGB): void {
    this.doc.setDrawColor(...color);
    this.doc.setFillColor(...color);
    this.doc.setLineWidth(1.2);

    const cx = x + size / 2;
    const cy = y + size  / 2;

    switch (type) {
      case "lightbulb": {
        this.doc.setLineWidth(0.9);

        // Bombilla
        this.doc.circle(cx, cy - size * 0.1, size * 0.30, "S");

        // Base
        this.doc.rect(cx - size * 0.16, cy + size * 0.20, size * 0.32, size * 0.14, "S");

        // Rosca
        this.doc.setLineWidth(0.6);
        const baseY = cy + size * 0.22;
        this.doc.line(cx - size * 0.16, baseY, cx + size * 0.16, baseY);
        this.doc.line(cx - size * 0.16, baseY + size * 0.05, cx + size * 0.16, baseY + size * 0.05);

        // Filamento simple (minimalista)
        this.doc.setLineWidth(0.9);
        this.doc.line(cx - size * 0.08, cy - size * 0.18, cx, cy - size * 0.05);
        this.doc.line(cx + size * 0.08, cy - size * 0.18, cx, cy - size * 0.05);

        // Rayos finos
        const rayLen = size * 0.18;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = cx + Math.cos(angle) * (size * 0.38);
          const y1 = cy - size * 0.1 + Math.sin(angle) * (size * 0.38);
          const x2 = cx + Math.cos(angle) * (size * 0.38 + rayLen);
          const y2 = cy - size * 0.1 + Math.sin(angle) * (size * 0.38 + rayLen);
          this.doc.line(x1, y1, x2, y2);
        }
        break;
      }

      case "target": {
        this.doc.setLineWidth(0.9);

        // Anillos delgados
        this.doc.circle(cx, cy, size * 0.44, "S");
        this.doc.circle(cx, cy, size * 0.28, "S");
        this.doc.circle(cx, cy, size * 0.12, "S");

        // Líneas de mira
        this.doc.setLineWidth(0.6);
        this.doc.line(cx - size * 0.45, cy, cx + size * 0.45, cy);
        this.doc.line(cx, cy - size * 0.45, cx, cy + size * 0.45);
        break;
      }

      case "money": {
        this.doc.setLineWidth(0.9);
        this.doc.circle(cx, cy, size * 0.44, "S");

        // Símbolo Bs delgado
        this.doc.setFont("helvetica", "bold");
        this.doc.setFontSize(size * 0.80);

        this.doc.text("Bs", cx, cy + size * 0.12, { align: "center" });

        // Líneas decorativas delgadas
        this.doc.setLineWidth(0.6);
        this.doc.line(cx - size * 0.20, cy - size * 0.30, cx + size * 0.20, cy - size * 0.30);
        this.doc.line(cx - size * 0.20, cy + size * 0.33, cx + size * 0.20, cy + size * 0.33);
        break;
      }

      case "rocket": {
        this.doc.setLineWidth(0.9);

        // Punta delgada
        this.doc.triangle(
          cx, y + size * 0.06,
          cx - size * 0.18, cy + size * 0.10,
          cx + size * 0.18, cy + size * 0.10,
          "S"
        );

        // Cuerpo delgado
        this.doc.rect(cx - size * 0.18, cy + size * 0.10, size * 0.36, size * 0.32, "S");

        // Ventana
        this.doc.circle(cx, cy + size * 0.05, size * 0.11, "S");

        // Aletas
        this.doc.triangle(
          cx - size * 0.18, cy + size * 0.28,
          cx - size * 0.34, cy + size * 0.50,
          cx - size * 0.18, cy + size * 0.50,
          "S"
        );
        this.doc.triangle(
          cx + size * 0.18, cy + size * 0.28,
          cx + size * 0.34, cy + size * 0.50,
          cx + size * 0.18, cy + size * 0.50,
          "S"
        );

        // Llama fina
        this.doc.triangle(
          cx - size * 0.12, cy + size * 0.42,
          cx, cy + size * 0.60,
          cx + size * 0.12, cy + size * 0.42,
          "S"
        );
        break;
      }
    }
  }

  private addSectionHeader(title: string, iconType: string, color: RGB): void {
    this.checkPageBreak(35);

    // Sombra
    this.doc.setFillColor(180, 180, 180);
    this.doc.roundedRect(this.margin - 4, this.y - 3, this.contentWidth + 8, 16, 3, 3, "F");

    // Fondo principal
    this.doc.setFillColor(...color);
    this.doc.roundedRect(this.margin - 5, this.y - 5, this.contentWidth + 10, 16, 3, 3, "F");

    // Acento dorado
    this.doc.setDrawColor(...this.colors.gold);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin - 5, this.y - 5, this.margin + this.contentWidth + 5, this.y - 5);

    // Icono
    const iconSize = 10;
    this.drawIcon(iconType, this.margin + 2, this.y - 2, iconSize, this.colors.white);

    // Título
    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(15);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.margin + iconSize + 8, this.y + 6);

    this.y += 22;
    this.doc.setTextColor(...this.colors.text);
  }

  private addSubsection(title: string): void {
    this.checkPageBreak(18);

    // Línea decorativa
    this.doc.setDrawColor(...this.colors.success);
    this.doc.setLineWidth(2.5);
    this.doc.line(this.margin, this.y, this.margin + 12, this.y);

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.darkGreen);
    this.doc.text(title, this.margin + 16, this.y + 1);

    this.y += 10;
  }

  private addField(label: string, value: string | number, indent = 0): void {
    const xPos = this.margin + indent;
    const maxWidth = this.contentWidth - indent - 5;
    const labelWidth = 50;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.secondary);

    // Calcular líneas para el valor
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.text);
    const valueStr = String(value || "N/A");
    const lines = this.doc.splitTextToSize(valueStr, maxWidth - labelWidth);

    const requiredSpace = Math.max(7, lines.length * 5 + 2);
    this.checkPageBreak(requiredSpace);

    // Fondo alternado sin línea visible arriba
    this.doc.setFillColor(...this.colors.background);
    this.doc.rect(xPos - 2, this.y - 4, maxWidth + 4, requiredSpace, "F");


    // Label
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text(`${label}:`, xPos, this.y);

    // Valor
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...this.colors.text);

    lines.forEach((line: string, idx: number) => {
      const lineY = this.y + (idx * 5);
      this.doc.text(line, xPos + labelWidth, lineY, { maxWidth: maxWidth - labelWidth });
    });

    this.y += requiredSpace + 2;
  }

  private addTable(headers: string[], rows: any[][]): void {
    this.checkPageBreak(35);

    const colWidth = this.contentWidth / headers.length;
    let startY = this.y;

    // Sombra
    this.doc.setFillColor(180, 180, 180);
    this.doc.rect(this.margin + 1, startY + 1, this.contentWidth, 11, "F");

    // Encabezados
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.margin, startY, this.contentWidth, 11, "F");

    // Borde superior dorado
    this.doc.setDrawColor(...this.colors.gold);
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, startY, this.margin + this.contentWidth, startY);

    this.doc.setTextColor(...this.colors.white);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");

    headers.forEach((header, i) => {
      const text = this.doc.splitTextToSize(header, colWidth - 4);
      this.doc.text(text, this.margin + (i * colWidth) + 2, startY + 7);
    });

    startY += 11;

    // Filas
    this.doc.setTextColor(...this.colors.text);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);

    rows.forEach((row, rowIdx) => {
      let maxLines = 1;
      row.forEach((cell) => {
        const text = String(cell);
        const lines = this.doc.splitTextToSize(text, colWidth - 4);
        maxLines = Math.max(maxLines, lines.length);
      });

      const rowHeight = Math.max(8, maxLines * 4.5 + 2);
      this.checkPageBreak(rowHeight + 2);

      // Fondo alternado
      if (rowIdx % 2 === 0) {
        this.doc.setFillColor(...this.colors.lightGray);
      } else {
        this.doc.setFillColor(...this.colors.white);
      }
      this.doc.rect(this.margin, startY, this.contentWidth, rowHeight, "F");

      // Bordes
      this.doc.setDrawColor(...this.colors.mediumGray);
      this.doc.setLineWidth(0.2);

      row.forEach((cell, colIdx) => {
        const text = String(cell);
        const lines = this.doc.splitTextToSize(text, colWidth - 4);

        this.doc.line(
          this.margin + (colIdx * colWidth),
          startY,
          this.margin + (colIdx * colWidth),
          startY + rowHeight
        );

        const textY = startY + (rowHeight / 2) + 1;
        lines.forEach((line: string, lineIdx: number) => {
          this.doc.text(
            line,
            this.margin + (colIdx * colWidth) + 2,
            textY + (lineIdx * 4.5),
            { maxWidth: colWidth - 4 }
          );
        });
      });

      this.doc.line(
        this.margin + this.contentWidth,
        startY,
        this.margin + this.contentWidth,
        startY + rowHeight
      );

      this.doc.line(
        this.margin,
        startY + rowHeight,
        this.margin + this.contentWidth,
        startY + rowHeight
      );

      startY += rowHeight;
    });

    this.y = startY + 8;
  }

  private addIdeaNegocio(idea: any): void {
    if (!idea) return;

    this.addSectionHeader("Idea de Negocio", "lightbulb", this.colors.primary);

    this.addField("Nombre del Negocio", idea.nombreNegocio);
    this.addField("Idea de Negocio", idea.ideaNegocio);
    this.addField("Propuesta de Valor", idea.propuestaValor);
    this.addField("Fortalezas", idea.fortalezas);
    this.addField("Oportunidades", idea.oportunidades);
    this.addField("Motivación", idea.motivacion);

    this.y += 8;
  }

  private addObjetivos(objetivos: any): void {
    if (!objetivos) return;

    this.addSectionHeader("Objetivos SMART", "target", this.colors.success);

    this.addField("¿Qué se quiere lograr?", objetivos.que);
    this.addField("¿A quién va dirigido?", objetivos.aQuien);
    this.addField("¿Cuándo se logrará?", objetivos.cuando);
    this.addField("¿Cómo se logrará?", objetivos.como);
    this.addField("¿Dónde se implementará?", objetivos.donde);

    this.y += 8;
  }

  private addCostos(costos: any, manoObra: any, costosIndirectos: any): void {
    this.addSectionHeader("Estructura de Costos", "money", this.colors.darkGreen);

    // Materia Prima
    if (costos) {
      this.addSubsection("Materia Prima");
      this.addField("Producto", costos.nombreProducto);
      this.addField("Unidades Producidas", costos.unidadesProducidas);

      if (costos.ingredientes?.length) {
        this.y += 5;
        const headers = ["Ingrediente", "Cantidad", "Unidad", "Costo (Bs)", "Costo/Unidad"];
        const rows = costos.ingredientes.map((ing: any) => [
          ing.nombre,
          ing.cantidadRequerida,
          ing.unidadPeso,
          ing.costoIngrediente.toFixed(2),
          ing.costoPorUnidad.toFixed(2),
        ]);
        this.addTable(headers, rows);
      }
    }

    // Mano de Obra
    if (manoObra) {
      this.addSubsection("Mano de Obra");
      this.addField("Salario Mínimo", `${manoObra.salarioMinimo} Bs`);
      this.addField("Días por Mes", manoObra.diasPorMes);
      this.addField("Horas por Día", manoObra.horasPorDia);
      this.addField("Horas por Receta", manoObra.horasReceta);

      const costoHora = manoObra.salarioMinimo / (manoObra.diasPorMes * manoObra.horasPorDia);
      const costoMO = costoHora * manoObra.horasReceta;
      this.addField("Costo por Hora", `${costoHora.toFixed(2)} Bs`);
      this.addField("Costo M.O. por Receta", `${costoMO.toFixed(2)} Bs`);

      this.y += 5;
    }

    // Costos Indirectos
    if (costosIndirectos?.indirectos?.length) {
      this.addSubsection("Costos Indirectos de Fabricación");
      const headers = ["Descripción", "Costo Mensual", "Horas Req.", "Costo Neto"];
      const rows = costosIndirectos.indirectos.map((ind: any) => [
        ind.descripcion,
        `${ind.costoMensual} Bs`,
        ind.horasRequeridas,
        `${ind.costoNeto.toFixed(2)} Bs`,
      ]);
      this.addTable(headers, rows);
    }

    this.y += 8;
  }

  private addPonEnMarcha(ponEnMarcha: any): void {
    if (!ponEnMarcha) return;

    this.addSectionHeader("Estrategia de Mercado", "rocket", this.colors.secondary);

    this.addField("Clientes", ponEnMarcha.clientes);
    this.addField("Competencia", ponEnMarcha.competencia);
    this.addField("Aliados", ponEnMarcha.aliados);
    this.addField("Puntos de Distribución", ponEnMarcha.puntosDistribucion);
    this.addField("Mercadeo", ponEnMarcha.mercadeo);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.y + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.y = this.margin;
    }
  }
}
