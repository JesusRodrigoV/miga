import { Injectable } from "@angular/core";
import { jsPDF } from "jspdf";

@Injectable({
  providedIn: "root",
})
export class PdfGenerator {
  generate(planId: string, secciones: any): void {
    const doc = new jsPDF();
    let y = 10;

    const addText = (label: string, value: string | number) => {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(`${label}: ${value}`, 10, y);
      y += 10;
    };

    const addSectionTitle = (title: string) => {
      if (y > 270) {
        doc.addPage();
        y = 10;
      }
      y += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(title, 10, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y += 10;
    };

    doc.setFontSize(16);
    doc.text("📄 Plan de Negocio - MIGA", 10, y);
    y += 15;
    doc.setFontSize(10);

    const idea = secciones["idea"];
    if (idea) {
      addSectionTitle("🧠 Parte 1: Idea de Negocio");
      addText("Fortalezas", idea.fortalezas || "");
      addText("Oportunidades", idea.oportunidades || "");
      addText("Idea de Negocio", idea.ideaNegocio || "");
      addText("Nombre del Negocio", idea.nombreNegocio || "");
      addText("Propuesta de Valor", idea.propuestaValor || "");
      addText("Motivación", idea.motivacion || "");
    }

    const obj = secciones["objetivos"];
    if (obj) {
      addSectionTitle("🎯 Parte 2: Objetivo SMART");
      addText("¿Qué se quiere lograr?", obj.que || "");
      addText("¿A quién va dirigido?", obj.aQuien || "");
      addText("¿Cuándo se logrará?", obj.cuando || "");
      addText("¿Cómo se logrará?", obj.como || "");
      addText("¿Dónde se implementará?", obj.donde || "");
    }

    const costos = secciones["materia-prima"];
    if (costos) {
      addSectionTitle("Parte 3.1: Costos - Materia Prima");
      addText("Nombre del producto", costos.nombreProducto || "");
      addText("Unidades producidas", costos.unidadesProducidas || "");

      if (costos.ingredientes && Array.isArray(costos.ingredientes)) {
        doc.setFont("helvetica", "bold");
        doc.text("Ingredientes:", 10, y);
        doc.setFont("helvetica", "normal");
        y += 10;

        costos.ingredientes.forEach((ing: any) => {
          addText(`- ${ing.nombre}`, `Costo: ${ing.costoIngrediente} Bs`);
        });
      }
    }

    const mo = secciones["mano-obra"];
    if (mo) {
      addSectionTitle("👷 Parte 3.2: Mano de Obra");
      addText("Salario mínimo", mo.salarioMinimo || 0);
      addText("Días por mes", mo.diasPorMes || 0);
      addText("Horas por día", mo.horasPorDia || 0);
      addText("Horas por receta", mo.horasReceta || 0);
    }

    const ci = secciones["costos-indirectos"];
    if (ci) {
      addSectionTitle("🏭 Parte 3.3: Costos Indirectos");
      if (ci.indirectos && Array.isArray(ci.indirectos)) {
        ci.indirectos.forEach((ind: any) => {
          addText(
            `- ${ind.descripcion}`,
            `Costo mensual: ${ind.costoMensual} Bs`,
          );
        });
      }
    }

    const pm = secciones["pon-en-marcha"];
    if (pm) {
      addSectionTitle("🚀 Parte 4: Pon en Marcha");
      addText("Aliados", pm.aliados || "");
      addText("Clientes", pm.clientes || "");
      addText("Competencia", pm.competencia || "");
      addText("Distribución", pm.distribucion || "");
      addText("Promoción", pm.promocion || "");
    }

    doc.save(`plan-negocio-${planId}.pdf`);
  }
}
