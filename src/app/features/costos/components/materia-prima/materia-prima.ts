import { DecimalPipe, NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  effect,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MateriaPrimaStore } from "../../store/materia-prima.store";
import { MgInput } from "@shared/components/mg-input";
import { MgButton } from "@shared/components/mg-button";

interface Unidad {
  value: string;
  label: string;
  categoria: 'peso' | 'volumen' | 'unidad';
  factorBase: number;
}

@Component({
  selector: "app-materia-prima",
  imports: [ReactiveFormsModule, DecimalPipe, MgButton, MgInput],
  templateUrl: "./materia-prima.html",
  styleUrl: "./materia-prima.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MateriaPrimaStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class MateriaPrima implements OnInit {
  form: FormGroup;
  totalCostoIngredientes = 0;
  totalCostoPorUnidad = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(MateriaPrimaStore);
  ingredienteCollapsed: boolean[] = [];

  // Método para alternar el colapso de un ingrediente
  toggleIngrediente(index: number): void {
    this.ingredienteCollapsed[index] = !this.ingredienteCollapsed[index];
  }

  // Catálogo completo de unidades
  readonly unidadesDisponibles: Unidad[] = [
    // PESO (base: gramos)
    { value: 'gramo', label: 'Gramo (g)', categoria: 'peso', factorBase: 1 },
    { value: 'kilogramo', label: 'Kilogramo (kg)', categoria: 'peso', factorBase: 1000 },
    { value: 'libra', label: 'Libra (lb)', categoria: 'peso', factorBase: 453.592 },
    { value: 'onza', label: 'Onza (oz)', categoria: 'peso', factorBase: 28.3495 },
    { value: 'tonelada', label: 'Tonelada (t)', categoria: 'peso', factorBase: 1000000 },

    // VOLUMEN (base: mililitros)
    { value: 'mililitro', label: 'Mililitro (ml)', categoria: 'volumen', factorBase: 1 },
    { value: 'litro', label: 'Litro (l)', categoria: 'volumen', factorBase: 1000 },
    { value: 'galon', label: 'Galón', categoria: 'volumen', factorBase: 3785.41 },
    { value: 'cuarto', label: 'Cuarto de galón', categoria: 'volumen', factorBase: 946.353 },
    { value: 'taza', label: 'Taza', categoria: 'volumen', factorBase: 236.588 },
    { value: 'cucharada', label: 'Cucharada', categoria: 'volumen', factorBase: 14.7868 },
    { value: 'cucharadita', label: 'Cucharadita', categoria: 'volumen', factorBase: 4.92892 },

    // UNIDAD (base: unidades)
    { value: 'unidad', label: 'Unidad', categoria: 'unidad', factorBase: 1 },
    { value: 'docena', label: 'Docena', categoria: 'unidad', factorBase: 12 },
    { value: 'paquete', label: 'Paquete', categoria: 'unidad', factorBase: 1 },
    { value: 'caja', label: 'Caja', categoria: 'unidad', factorBase: 1 },
  ];

  constructor() {
    console.log("[MateriaPrima Component] Constructor called");

    this.form = this.fb.group({
      nombreProducto: ["", Validators.required],
      unidadesProducidas: [1, [Validators.required, Validators.min(1)]],
      ingredientes: this.fb.array([]),
    });

    // Efecto para cargar datos iniciales cuando estén disponibles
    effect(() => {
      const initialData = this.store.initialData();
      console.log("[MateriaPrima Component] Initial data effect triggered:", initialData);

      if (initialData && initialData.inputs_json) {
        this.loadFormData(initialData.inputs_json);
      }
    });

    // Efecto para navegar después de guardar exitosamente
    effect(() => {
      const isSaved = this.store.isSaved();
      const planId = this.store.planId();

      console.log("[MateriaPrima Component] Save status changed:", isSaved);

      if (isSaved && planId) {
        console.log("[MateriaPrimaComponent] Navigating to costos-indirectos");
        this.router.navigate(["/costos/mano-de-obra"], {
          queryParams: { planId },
        });
      }
    });
  }

  ngOnInit() {
    console.log("[MateriaPrima Component] ngOnInit called");

    this.route.queryParams.subscribe((params) => {
      const planId = params["planId"] || null;
      console.log("[MateriaPrima Component] Query params planId:", planId);

      this.store.loadPageData(planId);
    });

    // Si no hay datos iniciales, agregar un ingrediente vacío
    setTimeout(() => {
      if (this.ingredientes.length === 0) {
        console.log("[MateriaPrima Component] Adding empty ingredient");
        this.addIngrediente();
      }
    }, 500);
  }

  get ingredientes(): FormArray {
    return this.form.get("ingredientes") as FormArray;
  }

  addIngrediente() {
    console.log("[MateriaPrima Component] addIngrediente called");


    const ingredienteForm = this.fb.group({
      nombre: ["", Validators.required],
      unidadMercado: ["", Validators.required],
      precioMercado: [0, [Validators.required, Validators.min(0)]],
      unidadPeso: ["", Validators.required],
      cantidadRequerida: [0, [Validators.required, Validators.min(0)]],
      costoIngrediente: [0],
      mpPorUnidad: [0],
      costoPorUnidad: [0],
    });
    this.ingredienteCollapsed.push(false);

    this.ingredientes.push(ingredienteForm);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  removeIngrediente(index: number) {
    console.log("[MateriaPrima Component] removeIngrediente called, index:", index);

    this.ingredientes.removeAt(index);
    this.calcularTotales();
    this.ingredienteCollapsed.splice(index, 1);
  }

  // Obtener unidades compatibles con la unidad de mercado seleccionada
  getUnidadesCompatibles(index: number): Unidad[] {
    const unidadMercado = this.ingredientes.at(index).get("unidadMercado")?.value;

    if (!unidadMercado) {
      return this.unidadesDisponibles;
    }

    const unidadMercadoData = this.unidadesDisponibles.find(u => u.value === unidadMercado);

    if (!unidadMercadoData) {
      return this.unidadesDisponibles;
    }

    // Retornar solo unidades de la misma categoría
    return this.unidadesDisponibles.filter(u => u.categoria === unidadMercadoData.categoria);
  }

  onUnidadMercadoChange(index: number) {
    console.log("[MateriaPrima Component] onUnidadMercadoChange called, index:", index);

    const ingrediente = this.ingredientes.at(index);
    const unidadMercado = ingrediente.get("unidadMercado")?.value;
    const unidadPeso = ingrediente.get("unidadPeso")?.value;

    // Si ya hay una unidad de peso seleccionada, verificar si es compatible
    if (unidadPeso) {
      const unidadMercadoData = this.unidadesDisponibles.find(u => u.value === unidadMercado);
      const unidadPesoData = this.unidadesDisponibles.find(u => u.value === unidadPeso);

      // Si no son compatibles, limpiar la unidad de peso
      if (unidadMercadoData && unidadPesoData &&
          unidadMercadoData.categoria !== unidadPesoData.categoria) {
        ingrediente.patchValue({ unidadPeso: "" });
      }
    }

    this.calcularTotales();
  }

  onUnidadPesoChange(index: number) {
    console.log("[MateriaPrima Component] onUnidadPesoChange called, index:", index);
    this.calcularTotales();
  }

  // Calcular el factor de conversión entre dos unidades
  private calcularFactorConversion(unidadOrigen: string, unidadDestino: string): number {
    const origen = this.unidadesDisponibles.find(u => u.value === unidadOrigen);
    const destino = this.unidadesDisponibles.find(u => u.value === unidadDestino);

    if (!origen || !destino) {
      console.warn("[MateriaPrima Component] Unidad no encontrada:", { unidadOrigen, unidadDestino });
      return 1;
    }

    if (origen.categoria !== destino.categoria) {
      console.warn("[MateriaPrima Component] Unidades incompatibles:", { origen, destino });
      return 1;
    }

    // Factor de conversión: cuántas unidades destino hay en una unidad origen
    const factor = origen.factorBase / destino.factorBase;
    console.log(`[MateriaPrima Component] Factor de conversión ${unidadOrigen} -> ${unidadDestino}:`, factor);

    return factor;
  }

  calcularTotales() {
    console.log("[MateriaPrima Component] calcularTotales called");

    const unidades = this.form.value.unidadesProducidas || 1;
    this.totalCostoIngredientes = 0;
    this.totalCostoPorUnidad = 0;

    this.ingredientes.controls.forEach((group, index) => {
      const precioMercado = group.get("precioMercado")?.value || 0;
      const unidadMercado = group.get("unidadMercado")?.value;
      const unidadPeso = group.get("unidadPeso")?.value;
      const cantidadRequerida = group.get("cantidadRequerida")?.value || 0;

      if (!unidadMercado || !unidadPeso || precioMercado === 0 || cantidadRequerida === 0) {
        group.patchValue(
          {
            costoIngrediente: 0,
            mpPorUnidad: 0,
            costoPorUnidad: 0,
          },
          { emitEvent: false }
        );
        return;
      }

      // Calcular el factor de conversión
      const factorConversion = this.calcularFactorConversion(unidadMercado, unidadPeso);

      // Costo por unidad de peso = precio de mercado / cantidad de unidades de peso que contiene
      const costoPorUnidadPeso = precioMercado / factorConversion;

      // Costo total del ingrediente = costo por unidad de peso * cantidad requerida
      const costoIng = costoPorUnidadPeso * cantidadRequerida;

      // MP por unidad producida
      const mpU = cantidadRequerida / unidades;

      // Costo por unidad producida
      const costoU = costoIng / unidades;

      group.patchValue(
        {
          costoIngrediente: costoIng,
          mpPorUnidad: mpU,
          costoPorUnidad: costoU,
        },
        { emitEvent: false }
      );

      this.totalCostoIngredientes += costoIng;
      this.totalCostoPorUnidad += costoU;
    });

    console.log("[MateriaPrima Component] Totales calculados:", {
      totalCostoIngredientes: this.totalCostoIngredientes,
      totalCostoPorUnidad: this.totalCostoPorUnidad,
    });
  }

  private loadFormData(inputsJson: any) {
    console.log("[MateriaPrima Component] loadFormData called:", inputsJson);

    this.form.patchValue({
      nombreProducto: inputsJson.nombreProducto,
      unidadesProducidas: inputsJson.unidadesProducidas,
    });

    // Limpiar ingredientes existentes
    while (this.ingredientes.length) {
      this.ingredientes.removeAt(0);
    }

    // Cargar ingredientes guardados
    inputsJson.ingredientes?.forEach((ing: any) => {
      const ingredienteForm = this.fb.group({
        nombre: [ing.nombre, Validators.required],
        unidadMercado: [ing.unidadMercado, Validators.required],
        precioMercado: [ing.precioMercado, [Validators.required, Validators.min(0)]],
        unidadPeso: [ing.unidadPeso, Validators.required],
        cantidadRequerida: [ing.cantidadRequerida, [Validators.required, Validators.min(0)]],
        costoIngrediente: [ing.costoIngrediente],
        mpPorUnidad: [ing.mpPorUnidad],
        costoPorUnidad: [ing.costoPorUnidad],
      });
      this.ingredientes.push(ingredienteForm);
    });

    this.calcularTotales();
    console.log("[MateriaPrima Component] Form data loaded successfully");
  }

  // Método helper para obtener el label de una unidad
  getUnidadLabel(unidadValue: string): string {
    const unidad = this.unidadesDisponibles.find(u => u.value === unidadValue);
    return unidad ? unidad.label : '-';
  }

  // Método helper para obtener el label de la unidad de peso de un ingrediente
  getUnidadPesoLabel(index: number): string {
    const unidadValue = this.ingredientes.at(index).get('unidadPeso')?.value;
    return this.getUnidadLabel(unidadValue);
  }

  async onSubmit() {
    console.log("[MateriaPrima Component] onSubmit called");

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn("[MateriaPrima Component] Form is invalid");
      alert("Por favor complete todos los campos requeridos correctamente.");
      return;
    }

    const formData = this.form.getRawValue();
    const outputs = {
      totalCostoIngredientes: this.totalCostoIngredientes,
      totalCostoPorUnidad: this.totalCostoPorUnidad,
    };

    console.log("[MateriaPrima Component] Submitting form data:", formData);
    console.log("[MateriaPrima Component] Submitting outputs:", outputs);

    await this.store.saveMateriaPrima(formData, outputs);
  }
}
