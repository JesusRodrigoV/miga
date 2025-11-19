import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { getSupabase } from "@core/services";
import { SupabaseClient } from "@supabase/supabase-js";

@Component({
  selector: "app-resumen-costos",
  imports: [DecimalPipe],
  templateUrl: "./resumen-costos.html",
  styleUrl: "./resumen-costos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResumenCostos {
  planId: string | null = null;

  totalMP = 0;
  totalMO = 0;
  totalCI = 0;
  unidades = 1;

  cp = 0;
  cc = 0;
  cpcc = 0;
  cu = 0;

  msg = "";

  private route = inject(ActivatedRoute);

  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }

    this.supabase = await getSupabase();
    return this.supabase;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;
      if (!this.planId) {
        this.msg = "❌ Plan no encontrado";
        return;
      }

      try {
        await this.cargarDatos();
        this.calcularResumen();
      } catch (err) {
        this.msg = "❌ Error al obtener los datos";
      }
    });
  }

  async cargarDatos() {
    const get = async (tipo: string) => {
      const supabase = await this.getClient();
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("plan_id", this.planId)
        .eq("tipo", tipo)
        .single();
      return data;
    };

    const mp = await get("costos");
    const mo = await get("mano-obra");
    const ci = await get("costos-indirectos");

    this.unidades = mp?.inputs_json?.unidadesProducidas || 1;
    this.totalMP = mp?.outputs_json?.totalCostoIngredientes || 0;
    this.totalMO = mo?.outputs_json?.pagoReceta || 0;
    this.totalCI = ci?.outputs_json?.totalCostoIndirecto || 0;
  }

  calcularResumen() {
    this.cp = this.totalMP + this.totalMO;
    this.cc = this.totalMO + this.totalCI;
    this.cpcc = this.totalMP + this.totalMO + this.totalCI;
    this.cu = this.cpcc / this.unidades;
  }
}
