import { DecimalPipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  CUSTOM_ELEMENTS_SCHEMA,
  effect,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";
import { ResumenCostosStore } from "../../store/resumen-costos.store";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-resumen-costos",
  imports: [DecimalPipe, MgButton, CommonModule],
  templateUrl: "./resumen-costos.html",
  styleUrl: "./resumen-costos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ResumenCostosStore],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class ResumenCostos implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(ResumenCostosStore);

  constructor() {
    console.log("[ResumenCostos Component] Constructor called");

    // Efecto para logging de cambios en el estado
    effect(() => {
      const isLoading = this.store.isLoading();
      console.log("[ResumenCostos Component] Loading status changed:", isLoading);
    });

    effect(() => {
      const hasSufficientData = this.store.hasSufficientData();
      console.log("[ResumenCostos Component] Has sufficient data:", hasSufficientData);
    });

    effect(() => {
      const totals = {
        totalMP: this.store.totalMP(),
        totalMO: this.store.totalMO(),
        totalCI: this.store.totalCI(),
        unidades: this.store.unidades(),
        costoPonderado: this.store.costoPonderado(),
        costoConversion: this.store.costoConversion(),
        costoProduccion: this.store.costoProduccion(),
        costoUnitario: this.store.costoUnitario(),
      };
      console.log("[ResumenCostos Component] Totals updated:", totals);
    });
  }

  ngOnInit() {
    console.log("[ResumenCostos Component] ngOnInit called");

    this.route.queryParams.subscribe((params) => {
      const planId = params["planId"] || null;
      console.log("[ResumenCostos Component] Query params planId:", planId);

      this.store.loadResumen(planId);
    });
  }

  navigateToPonEnMarcha() {
    const planId = this.store.planId();
    console.log("[ResumenCostos Component] Navigating to pon-en-marcha with planId:", planId);

    this.router.navigate(["/pon-en-marcha"], {
      queryParams: { planId },
    });
  }
}
