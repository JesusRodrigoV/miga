import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { getSupabase } from "@core/services";
import jsPDF from "jspdf";

@Component({
  selector: "app-generar-pdf",
  imports: [],
  templateUrl: "./generar-pdf.html",
  styleUrl: "./generar-pdf.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GenerarPdf implements OnInit {
  planId: string | null = null;

  secciones: any = {};

  msg = "";

  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;

      if (!this.planId) {
        this.msg = "❌ Plan no encontrado";

        return;
      }

      try {
        await this.cargarSecciones();
      } catch (error) {
        this.msg = "❌ Error al cargar los datos del plan";
      }
    });
  }

  async cargarSecciones() {
    const tipos = [
      "idea",
      "objetivo",
      "costos",
      "mano-obra",
      "costos-indirectos",
      "pon-en-marcha",
    ];

    for (const tipo of tipos) {
      const supabase = await getSupabase();
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("plan_id", this.planId)
        .eq("tipo", tipo)
        .single();

      if (data) this.secciones[tipo] = data.inputs_json;
    }
  }

  generarPDF() {
    const doc = new jsPDF();

    let y = 10;

    const addText = (label: string, value: string | number) => {
      doc.text(`${label}: ${value}`, 10, y);

      y += 10;
    };

    doc.setFontSize(16);

    doc.text("📄 Plan de Negocio - MIGA", 10, y);

    y += 15;

    doc.setFontSize(12);

    // IDEA

    doc.text("🧠 Parte 1: Idea de Negocio", 10, y);
    y += 10;

    const idea = this.secciones["idea"];

    if (idea) {
      addText("Nombre", idea.nombre || "");

      addText("Problema", idea.problema || "");

      addText("Solución", idea.solucion || "");
    }

    // OBJETIVO

    y += 10;

    doc.text("🎯 Parte 2: Objetivo", 10, y);
    y += 10;

    const obj = this.secciones["objetivo"];

    if (obj) {
      addText("¿Qué se quiere lograr?", obj.que || "");

      addText("¿A quién va dirigido?", obj.aQuien || "");

      addText("¿Cuándo?", obj.cuando || "");

      addText("¿Cómo?", obj.como || "");

      addText("¿Dónde?", obj.donde || "");
    }

    // COSTOS - MATERIA PRIMA

    y += 10;

    doc.text("💰 Parte 3.1: Costos - Materia Prima", 10, y);
    y += 10;

    const costos = this.secciones["costos"];

    if (costos) {
      addText("Nombre del producto", costos.nombreProducto || "");

      addText("Unidades producidas", costos.unidadesProducidas || "");

      doc.text("Ingredientes:", 10, y);
      y += 10;

      costos.ingredientes?.forEach((ing: any) => {
        addText(`- ${ing.nombre}`, `Costo: ${ing.costoIngrediente} Bs`);
      });
    }

    // MANO DE OBRA

    y += 10;

    doc.text("👷 Parte 3.2: Mano de Obra", 10, y);
    y += 10;

    const mo = this.secciones["mano-obra"];

    if (mo) {
      addText("Salario mínimo", mo.salarioMinimo);

      addText("Días por mes", mo.diasPorMes);

      addText("Horas por día", mo.horasPorDia);

      addText("Horas por receta", mo.horasReceta);
    }

    // COSTOS INDIRECTOS

    y += 10;

    doc.text("🏭 Parte 3.3: Costos Indirectos", 10, y);
    y += 10;

    const ci = this.secciones["costos-indirectos"];

    if (ci && ci.indirectos) {
      ci.indirectos.forEach((ind: any) => {
        addText(
          `- ${ind.descripcion}`,
          `Costo mensual: ${ind.costoMensual} Bs`,
        );
      });
    }

    // PON EN MARCHA

    y += 10;

    doc.text("🚀 Parte 4: Pon en Marcha", 10, y);
    y += 10;

    const pm = this.secciones["pon-en-marcha"];

    if (pm) {
      addText("Aliados", pm.aliados || "");

      addText("Clientes", pm.clientes || "");

      addText("Competencia", pm.competencia || "");

      addText("Distribución", pm.distribucion || "");

      addText("Promoción", pm.promocion || "");
    }

    doc.save(`plan-negocio-${this.planId}.pdf`);
  }
}
