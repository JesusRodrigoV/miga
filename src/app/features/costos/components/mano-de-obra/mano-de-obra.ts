import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  effect,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MgInput } from "@shared/components/mg-input";
import { MgButton } from "@shared/components/mg-button";

import { ManoDeObraStore } from "../../store/mano-de-obra.store";

@Component({
  selector: "app-mano-de-obra",
  imports: [ReactiveFormsModule, DecimalPipe, MgButton, MgInput],
  templateUrl: "./mano-de-obra.html",
  styleUrl: "./mano-de-obra.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ManoDeObraStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ManoDeObra implements OnInit {
  form: FormGroup;
  pagoHora = 0;
  pagoReceta = 0;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(ManoDeObraStore);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    console.log("[ManoDeObra Component] Constructor called");

    this.form = this.fb.group({
      salarioMinimo: [2750, [Validators.required, Validators.min(1)]],
      diasPorMes: [30, [Validators.required, Validators.min(1)]],
      horasPorDia: [8, [Validators.required, Validators.min(1)]],
      horasReceta: [1, [Validators.required, Validators.min(0.1)]],
    });

    // Efecto para cargar datos iniciales
    effect(() => {
      const initialData = this.store.initialData();
      console.log("[ManoDeObra Component] Initial data effect triggered:", initialData);
      this.calcularPago();
      if (initialData && initialData.inputs_json) {
        this.form.patchValue(initialData.inputs_json);
        this.calcularPago();
      }
    });

    // Efecto para navegar después de guardar
    effect(() => {
      const isSaved = this.store.isSaved();
      const planId = this.store.planId();

      console.log("[ManoDeObra Component] Save status changed:", isSaved);

      if (isSaved && planId) {
        console.log("[ManoDeObra Component] Navigating to costos-indirectos");
        this.router.navigate(["/costos/costos-indirectos"], {
          queryParams: { planId },
        });
      }
    });
  }

  ngOnInit() {
    console.log("[ManoDeObra Component] ngOnInit called");

    this.route.queryParams.subscribe((params) => {
      const planId = params["planId"] || null;
      console.log("[ManoDeObra Component] Query params planId:", planId);

      this.store.loadPageData(planId);
    });

    // Escuchar cambios en el formulario para recalcular
    this.form.valueChanges.subscribe(() => {
      console.log("[ManoDeObra Component] Form values changed");
      this.calcularPago();
    });
  }

  calcularPago() {
    console.log("[ManoDeObra Component] calcularPago called");

    const salario = this.form.get("salarioMinimo")?.value || 0;
    const dias = this.form.get("diasPorMes")?.value || 1;
    const horas = this.form.get("horasPorDia")?.value || 1;
    const horasReceta = this.form.get("horasReceta")?.value || 0;

    this.pagoHora = salario / dias / horas;
    this.pagoReceta = this.pagoHora * horasReceta;

    this.cdr.markForCheck();

    console.log("[ManoDeObra Component] Pagos calculados:", {
      pagoHora: this.pagoHora,
      pagoReceta: this.pagoReceta,
    });
  }

  async onSubmit() {
    console.log("[ManoDeObra Component] onSubmit called");

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.warn("[ManoDeObra Component] Form is invalid");
      return;
    }

    const formData = this.form.getRawValue();
    const outputs = {
      pagoHora: this.pagoHora,
      pagoReceta: this.pagoReceta,
    };

    console.log("[ManoDeObra Component] Submitting form data:", formData);
    console.log("[ManoDeObra Component] Submitting outputs:", outputs);

    await this.store.saveManoDeObra(formData, outputs);
  }
}
