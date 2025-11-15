import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { supabase } from "@core/supabase.client";

@Component({
  selector: "app-materia-prima",
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: "./materia-prima.html",
  styleUrl: "./materia-prima.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MateriaPrima implements OnInit {
  form: FormGroup;
  planId: string | null = null;
  msg = "";

  totalCostoIngredientes = 0;
  totalCostoPorUnidad = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  constructor() {
    this.form = this.fb.group({
      nombreProducto: ["", Validators.required],
      unidadesProducidas: [1, [Validators.required, Validators.min(1)]],
      ingredientes: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      this.planId = params["planId"] || null;

      if (!this.planId) {
        const { data, error } = await supabase.rpc("create_or_get_plan");
        if (error) {
          this.msg = "Error al obtener el plan";
          return;
        }
        this.planId = data;
      }

      await this.loadSection();
      if (this.ingredientes.length === 0) {
        this.addIngrediente();
      }
    });
  }

  get ingredientes(): FormArray {
    return this.form.get("ingredientes") as FormArray;
  }

  addIngrediente() {
    const ingredienteForm = this.fb.group({
      nombre: ["", Validators.required],
      unidadMercado: ["", Validators.required],
      precioMercado: [0, Validators.required],
      peso: [{ value: 0, disabled: true }],
      unidadPeso: ["Gramos"],
      cantidadRequerida: [0, Validators.required],
      costoIngrediente: [0],
      mpPorUnidad: [0],
      costoPorUnidad: [0],
    });
    this.ingredientes.push(ingredienteForm);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  removeIngrediente(index: number) {
    this.ingredientes.removeAt(index);
    this.calcularTotales();
  }

  actualizarPeso(i: number) {
    const unidad = this.ingredientes.at(i).get("unidadMercado")?.value;
    let peso = 0;

    switch (unidad?.toLowerCase()) {
      case "libra":
        peso = 453.6;
        break;
      case "kilo":
        peso = 1000;
        break;
      case "unidad":
        peso = 1;
        break;
      case "botella":
        peso = 50;
        break;
      case "ml":
        peso = 1000;
        break;
    }

    this.ingredientes.at(i).patchValue({ peso });
    this.calcularTotales();
  }

  calcularTotales() {
    const unidades = this.form.value.unidadesProducidas || 1;
    this.totalCostoIngredientes = 0;
    this.totalCostoPorUnidad = 0;

    this.ingredientes.controls.forEach((group, index) => {
      const precio = group.get("precioMercado")?.value || 0;
      const peso = group.get("peso")?.value || 1;
      const cantidad = group.get("cantidadRequerida")?.value || 0;

      const costoIng = (precio / peso) * cantidad;
      const mpU = cantidad / unidades;
      const costoU = costoIng / unidades;

      group.patchValue(
        {
          costoIngrediente: costoIng,
          mpPorUnidad: mpU,
          costoPorUnidad: costoU,
        },
        { emitEvent: false },
      );

      this.totalCostoIngredientes += costoIng;
      this.totalCostoPorUnidad += costoU;
    });
  }

  async loadSection() {
    const { data } = await supabase
      .from("sections")
      .select("*")
      .eq("plan_id", this.planId)
      .eq("tipo", "costos")
      .single();

    if (data && data.inputs_json) {
      this.form.patchValue({
        nombreProducto: data.inputs_json.nombreProducto,
        unidadesProducidas: data.inputs_json.unidadesProducidas,
      });

      data.inputs_json.ingredientes.forEach((ing: any) => {
        const ingredienteForm = this.fb.group({
          nombre: [ing.nombre],
          unidadMercado: [ing.unidadMercado],
          precioMercado: [ing.precioMercado],
          peso: [{ value: ing.peso, disabled: true }],
          unidadPeso: [ing.unidadPeso],
          cantidadRequerida: [ing.cantidadRequerida],
          costoIngrediente: [ing.costoIngrediente],
          mpPorUnidad: [ing.mpPorUnidad],
          costoPorUnidad: [ing.costoPorUnidad],
        });
        this.ingredientes.push(ingredienteForm);
      });

      this.calcularTotales();
    }
  }

  async onSubmit() {
    if (!this.planId || this.form.invalid) return;

    const { error } = await supabase.from("sections").upsert(
      {
        plan_id: this.planId,
        tipo: "costos",
        inputs_json: this.form.getRawValue(),
        outputs_json: {
          totalCostoIngredientes: this.totalCostoIngredientes,
          totalCostoPorUnidad: this.totalCostoPorUnidad,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "plan_id,tipo" },
    );

    this.msg = error ? "❌ Error al guardar" : "✅ Costos guardados";
  }
}
