import { DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { getSupabase } from "@core/services";
import { StorageService } from "@core/services/storage-service";
import { MgButton } from "@shared/components/mg-button";
import { SupabaseClient } from "@supabase/supabase-js";

@Component({
  selector: "app-resumen-costos",
  imports: [DecimalPipe, MgButton],
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
  loading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private supabase: SupabaseClient | null = null;

  private async getClient(): Promise<SupabaseClient> {
    if (this.supabase) {
      return this.supabase;
    }

    this.supabase = await getSupabase();
    return this.supabase;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || this.storage.getItem("currentPlanId");
      if (!this.planId) {
        this.msg = "❌ Plan no encontrado";
        this.loading = false;
        return;
      }

      try {
        await this.cargarDatos();
        if (this.totalMP === 0 && this.totalMO === 0 && this.totalCI === 0) {
          this.msg = "ℹ️ Aún no se han registrado costos suficientes.";
        } else {
          this.calcularResumen();

          this.msg = "";
        }
      } catch (err) {
        this.msg = "❌ Error al obtener los datos";
      } finally {
        this.loading = false;
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

  navigateToPonEnMarcha() {
    this.router.navigate(["/pon-en-marcha"], {
      queryParams: { planId: this.planId },
    });
  }
}
