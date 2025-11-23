import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  effect,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";
import { MgInput } from "@shared/components/mg-input";
import { CostosIndirectosStore } from "../../store/costos-indirectos.store";

@Component({
  selector: "app-costos-indirectos",
  imports: [ReactiveFormsModule, DecimalPipe, MgButton, MgInput],
  templateUrl: "./costos-indirectos.html",
  styleUrl: "./costos-indirectos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CostosIndirectosStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class CostosIndirectos implements OnInit {
  form: FormGroup;
  totalCostoMensual = 0;
  totalCostoPorDia = 0;
  totalCostoPorHora = 0;
  totalHorasRequeridas = 0;
  totalCostoNeto = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(CostosIndirectosStore);

  itemCollapsed: boolean[] = [];

  // Método para alternar el colapso de un ítem
  toggleItem(index: number): void {
    this.itemCollapsed[index] = !this.itemCollapsed[index];
  }

  constructor() {
    console.log("[CostosIndirectos Component] Constructor called");

    this.form = this.fb.group({
      indirectos: this.fb.array([]),
    });

    // Efecto para cargar datos iniciales
    effect(() => {
      const initialData = this.store.initialData();
      console.log("[CostosIndirectos Component] Initial data effect triggered:", initialData);

      if (initialData && initialData.inputs_json) {
        this.loadFormData(initialData.inputs_json);
      }
    });

    // Efecto para navegar después de guardar
    effect(() => {
      const isSaved = this.store.isSaved();
      const planId = this.store.planId();

      console.log("[CostosIndirectos Component] Save status changed:", isSaved);

      if (isSaved && planId) {
        console.log("[CostosIndirectos Component] Navigating to resumen");
        this.router.navigate(["/costos/resumen"], {
          queryParams: { planId },
        });
      }
    });
  }

  ngOnInit() {
    console.log("[CostosIndirectos Component] ngOnInit called");

    this.route.queryParams.subscribe((params) => {
      const planId = params["planId"] || null;
      console.log("[CostosIndirectos Component] Query params planId:", planId);

      this.store.loadPageData(planId);
    });

    // Si no hay datos iniciales, agregar un item vacío
    setTimeout(() => {
      if (this.indirectos.length === 0) {
        console.log("[CostosIndirectos Component] Adding empty indirecto");
        this.addIndirecto();
      }
    }, 500);
  }

  get indirectos(): FormArray {
    return this.form.get("indirectos") as FormArray;
  }

  addIndirecto() {
    console.log("[CostosIndirectos Component] addIndirecto called");

    const group = this.fb.group({
      descripcion: ["", Validators.required],
      costoMensual: [0, [Validators.required, Validators.min(0)]],
      diasCalculados: [30, [Validators.required, Validators.min(1)]],
      costoPorDia: [{ value: 0, disabled: true }],
      costoPorHora: [{ value: 0, disabled: true }],
      horasRequeridas: [0, [Validators.required, Validators.min(0)]],
      costoNeto: [{ value: 0, disabled: true }],
    });

    group.valueChanges.subscribe(() => {
      console.log("[CostosIndirectos Component] Form group value changed");
      this.calcularTotales();
    });

    this.indirectos.push(group);
    this.itemCollapsed.push(false);
  }

  removeIndirecto(index: number) {
    console.log("[CostosIndirectos Component] removeIndirecto called, index:", index);

    this.indirectos.removeAt(index);
    this.calcularTotales();
    this.itemCollapsed.splice(index, 1);
  }

  calcularTotales() {
    console.log("[CostosIndirectos Component] calcularTotales called");

    this.totalCostoMensual = 0;
    this.totalCostoPorDia = 0;
    this.totalCostoPorHora = 0;
    this.totalHorasRequeridas = 0;
    this.totalCostoNeto = 0;

    this.indirectos.controls.forEach((control) => {
      const group = control as FormGroup;

      const mensual = Number(group.get("costoMensual")?.value) || 0;
      const dias = Number(group.get("diasCalculados")?.value) || 30;
      const horasReq = Number(group.get("horasRequeridas")?.value) || 0;

      const porDia = mensual / dias;
      const porHora = porDia / 8;
      const neto = porHora * horasReq;

      group.patchValue(
        {
          costoPorDia: porDia,
          costoPorHora: porHora,
          costoNeto: neto,
        },
        { emitEvent: false }
      );

      this.totalCostoMensual += mensual;
      this.totalCostoPorDia += porDia;
      this.totalCostoPorHora += porHora;
      this.totalHorasRequeridas += horasReq;
      this.totalCostoNeto += neto;
    });

    console.log("[CostosIndirectos Component] Totales calculados:", {
      totalCostoMensual: this.totalCostoMensual,
      totalCostoPorDia: this.totalCostoPorDia,
      totalCostoPorHora: this.totalCostoPorHora,
      totalHorasRequeridas: this.totalHorasRequeridas,
      totalCostoNeto: this.totalCostoNeto,
    });
  }

  private loadFormData(inputsJson: any) {
    console.log("[CostosIndirectos Component] loadFormData called:", inputsJson);

    // Limpiar indirectos existentes
    while (this.indirectos.length) {
      this.indirectos.removeAt(0);
    }

    // Cargar indirectos guardados
    inputsJson.indirectos?.forEach((ind: any) => {
      const group = this.fb.group({
        descripcion: [ind.descripcion || ""],
        costoMensual: [Number(ind.costoMensual) || 0, [Validators.required, Validators.min(0)]],
        diasCalculados: [Number(ind.diasCalculados) || 30, [Validators.required, Validators.min(1)]],
        horasRequeridas: [Number(ind.horasRequeridas) || 0, [Validators.required, Validators.min(0)]],
        costoPorDia: [{ value: Number(ind.costoPorDia) || 0, disabled: true }],
        costoPorHora: [{ value: Number(ind.costoPorHora) || 0, disabled: true }],
        costoNeto: [{ value: Number(ind.costoNeto) || 0, disabled: true }],
        });

      group.valueChanges.subscribe(() => this.calcularTotales());

      this.indirectos.push(group);
    });

    this.calcularTotales();
    console.log("[CostosIndirectos Component] Form data loaded successfully");
  }


  async onSubmit() {
    console.log("[CostosIndirectos Component] onSubmit called");

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn("[CostosIndirectos Component] Form is invalid");
      return;
    }

    const formData = this.form.getRawValue();
    const outputs = {
      totalCostoIndirecto: this.totalCostoNeto,
    };

    console.log("[CostosIndirectos Component] Submitting form data:", formData);
    console.log("[CostosIndirectos Component] Submitting outputs:", outputs);

    await this.store.saveCostosIndirectos(formData, outputs);
  }
}
