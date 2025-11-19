import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { getSupabase } from "@core/services";
import { StorageService } from "@core/services/storage-service";
import { SupabaseClient } from "@supabase/supabase-js";

@Component({
  selector: "app-mano-de-obra",
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: "./mano-de-obra.html",
  styleUrl: "./mano-de-obra.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ManoDeObra implements OnInit {
  form: FormGroup;
  planId: string | null = null;
  msg = "";

  pagoHora = 0;
  pagoReceta = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);

  constructor() {
    this.form = this.fb.group({
      salarioMinimo: [2750, [Validators.required, Validators.min(1)]],
      diasPorMes: [30, [Validators.required, Validators.min(1)]],
      horasPorDia: [8, [Validators.required, Validators.min(1)]],
      horasReceta: [1, [Validators.required, Validators.min(0.1)]],
    });
  }

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
      this.planId = params["planId"] || null;

      if (!this.planId) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.rpc("create_or_get_plan");
        if (error) {
          this.msg = "Error al obtener el plan";
          return;
        }
        this.planId = data;
      }

      this.storage.setItem("currentPlanId", this.planId!);

      await this.loadSection();
    });

    this.form.valueChanges.subscribe(() => this.calcularPago());
  }

  calcularPago() {
    const salario = this.form.get("salarioMinimo")?.value || 0;
    const dias = this.form.get("diasPorMes")?.value || 1;
    const horas = this.form.get("horasPorDia")?.value || 1;
    const horasReceta = this.form.get("horasReceta")?.value || 0;

    this.pagoHora = salario / dias / horas;
    this.pagoReceta = this.pagoHora * horasReceta;
  }

  async loadSection() {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", this.planId)
      .eq("tipo", "mano-obra")
      .single();

    if (data && data.inputs_json) {
      this.form.patchValue(data.inputs_json);
      this.calcularPago();
    }
  }

  async onSubmit() {
    if (!this.planId || this.form.invalid) return;
    const supabase = await this.getClient();
    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: this.planId,
        tipo: "mano-obra",
        inputs_json: this.form.getRawValue(),
        outputs_json: {
          pagoHora: this.pagoHora,
          pagoReceta: this.pagoReceta,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    if (!error) {
      await supabase
        .from("plans")
        .update({ ultima_seccion: "mano-obra" })
        .eq("id", this.planId);
    }

    const { error: updateError } = await supabase
      .from("plans")
      .update({ ultima_seccion: "mano-obra" })
      .eq("id", this.planId);

    if (updateError) {
      this.msg = "Guardado pero no se pudo actualizar la sección";
    } else {
      this.msg = "✅ Mano de obra guardada";
      this.router.navigate(["/costos/costos-indirectos"], {
        queryParams: { planId: this.planId },
      });
    }
  }
}
