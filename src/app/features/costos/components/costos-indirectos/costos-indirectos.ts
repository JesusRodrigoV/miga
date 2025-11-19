import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { getSupabase } from "@core/services";
import { StorageService } from "@core/services/storage-service";
import { MgButton } from "@shared/components/mg-button";
import { MgInput } from "@shared/components/mg-input";
import { ToastBuilder, ToastService } from "@shared/services/toast";
import { SupabaseClient } from "@supabase/supabase-js";

@Component({
  selector: "app-costos-indirectos",
  imports: [ReactiveFormsModule, DecimalPipe, MgButton, MgInput],
  templateUrl: "./costos-indirectos.html",
  styleUrl: "./costos-indirectos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CostosIndirectos implements OnInit {
  form: FormGroup;
  planId: string | null = null;

  isLoading = signal(false);

  totalCostoMensual = 0;
  totalCostoPorDia = 0;
  totalCostoPorHora = 0;
  totalHorasRequeridas = 0;
  totalCostoNeto = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private storage = inject(StorageService);
  private toastService = inject(ToastService);

  constructor() {
    this.form = this.fb.group({
      indirectos: this.fb.array([]),
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

  get indirectos(): FormArray {
    return this.form.get("indirectos") as FormArray;
  }

  addIndirecto() {
    console.log("Agregando ítem...");
    const group = this.fb.group({
      descripcion: ["", Validators.required],
      costoMensual: [0, [Validators.required, Validators.min(0)]],
      diasCalculados: [30, [Validators.required, Validators.min(1)]],
      costoPorDia: [{ value: 0, disabled: true }],
      costoPorHora: [{ value: 0, disabled: true }],
      horasRequeridas: [0, [Validators.required, Validators.min(0)]],
      costoNeto: [{ value: 0, disabled: true }],
    });

    group.valueChanges.subscribe(() => this.calcularTotales());

    this.indirectos.push(group);
  }

  removeIndirecto(index: number) {
    this.indirectos.removeAt(index);
    this.calcularTotales();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;

      if (!this.planId) {
        const supabase = await this.getClient();
        const { data, error } = await supabase.rpc("create_or_get_plan");
        if (error) throw error;
        this.planId = data;
      }

      this.storage.setItem("currentPlanId", this.planId!);

      this.cdr.detectChanges();

      await this.loadSection();
      if (this.indirectos.length === 0) this.addIndirecto();
    });
    this.cdr.detectChanges();
  }

  calcularTotales() {
    this.totalCostoMensual = 0;
    this.totalCostoPorDia = 0;
    this.totalCostoPorHora = 0;
    this.totalHorasRequeridas = 0;
    this.totalCostoNeto = 0;

    this.indirectos.controls.forEach((control) => {
      const group = control as FormGroup;

      const mensual = group.get("costoMensual")?.value || 0;
      const dias = group.get("diasCalculados")?.value || 1;
      const horasReq = group.get("horasRequeridas")?.value || 0;

      const porDia = mensual / dias;
      const porHora = porDia / 8;
      const neto = porHora * horasReq;

      group.patchValue(
        {
          costoPorDia: porDia,
          costoPorHora: porHora,
          costoNeto: neto,
        },
        { emitEvent: false },
      );

      this.totalCostoMensual += mensual;
      this.totalCostoPorDia += porDia;
      this.totalCostoPorHora += porHora;
      this.totalHorasRequeridas += horasReq;
      this.totalCostoNeto += neto;
    });
  }

  async loadSection() {
    const supabase = await this.getClient();
    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", this.planId)
      .eq("tipo", "costos-indirectos")
      .single();

    if (data && data.inputs_json) {
      data.inputs_json.indirectos.forEach((ind: any) => {
        const group = this.fb.group({
          descripcion: [ind.descripcion],
          costoMensual: [ind.costoMensual],
          diasCalculados: [ind.diasCalculados],
          costoPorDia: [{ value: ind.costoPorDia, disabled: true }],
          costoPorHora: [{ value: ind.costoPorHora, disabled: true }],
          horasRequeridas: [ind.horasRequeridas],
          costoNeto: [{ value: ind.costoNeto, disabled: true }],
        });

        group.valueChanges.subscribe(() => this.calcularTotales());

        this.indirectos.push(group);
      });

      this.calcularTotales();
    }
  }

  async onSubmit() {
    if (!this.planId) return;

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toastService.show(
        new ToastBuilder("Por favor, completa los campos requeridos")
          .deAdvertencia()
          .build(),
      );
      return;
    }

    this.isLoading.set(true);

    try {
      const supabase = await this.getClient();

      const { error: sectionError } = await supabase.from("sections").upsert(
        {
          plan_id: this.planId,
          tipo: "costos-indirectos",
          inputs_json: this.form.getRawValue(),
          outputs_json: { totalCostoIndirecto: this.totalCostoNeto },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "plan_id,tipo" },
      );

      if (sectionError) throw sectionError;

      const { error: planError } = await supabase
        .from("plans")
        .update({ ultima_seccion: "costos-indirectos" })
        .eq("id", this.planId);

      if (planError) throw planError;

      this.toastService.show(
        new ToastBuilder("Costos indirectos guardados").deExito().build(),
      );

      this.router.navigate(["/costos/resumen"], {
        queryParams: { planId: this.planId },
      });
    } catch (error: any) {
      this.toastService.show(
        new ToastBuilder(error.message || "Error al guardar").deError().build(),
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
