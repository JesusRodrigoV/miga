import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { computed } from "@angular/core";
import { CostosService } from "../services/costos.service";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type ResumenCostosState = {
  isLoading: boolean;
  planId: string | null;
  totalMP: number;
  totalMO: number;
  totalCI: number;
  unidades: number;
};

const initialState: ResumenCostosState = {
  isLoading: true,
  planId: null,
  totalMP: 0,
  totalMO: 0,
  totalCI: 0,
  unidades: 1,
};

export const ResumenCostosStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    // Costo Ponderado (CP) = Materia Prima + Mano de Obra
    costoPonderado: computed(() => store.totalMP() + store.totalMO()),

    // Costo de Conversión (CC) = Mano de Obra + Costos Indirectos
    costoConversion: computed(() => store.totalMO() + store.totalCI()),

    // Costo de Producción (CPcc = MP + MO + CI)
    costoProduccion: computed(() => {
      const unidades = store.unidades();
      if (unidades === 0) return 0;
      return (store.totalMP() + store.totalMO() + store.totalCI());
    }),

    // Costo Unitario (CU) = (MP + MO + CI) / unidades
    costoUnitario: computed(() => {
      const unidades = store.unidades();
      if (unidades === 0) return 0;
      return (store.totalMP() + store.totalMO() + store.totalCI()) / unidades;
    }),

    // Verifica si hay datos suficientes para mostrar el resumen
    hasSufficientData: computed(() =>
      store.totalMP() > 0 || store.totalMO() > 0 || store.totalCI() > 0
    ),
  })),
  withMethods(
    (
      store,
      service = inject(CostosService),
      toastService = inject(ToastService)
    ) => ({
      async loadResumen(planIdFromRoute: string | null) {
        console.log("[ResumenCostosStore] loadResumen called with planId:", planIdFromRoute);
        patchState(store, { isLoading: true });

        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          console.log("[ResumenCostosStore] Plan ID obtained:", planId);

          const sections = await service.loadAllSections(planId);
          console.log("[ResumenCostosStore] All sections loaded:", sections);

          // Extraer valores de cada sección
          const unidades = sections.materiaprima?.inputs_json?.unidadesProducidas || 1;
          const totalMP = sections.materiaprima?.outputs_json?.totalCostoIngredientes || 0;
          const totalMO = sections.manoDeObra?.outputs_json?.pagoReceta || 0;
          const totalCI = sections.costosIndirectos?.outputs_json?.totalCostoIndirecto || 0;

          console.log("[ResumenCostosStore] Extracted values:", {
            unidades,
            totalMP,
            totalMO,
            totalCI,
          });

          patchState(store, {
            planId,
            totalMP,
            totalMO,
            totalCI,
            unidades,
            isLoading: false,
          });

          if (!store.hasSufficientData()) {
            console.warn("[ResumenCostosStore] Insufficient data for summary");
            toastService.show(
              new ToastBuilder("Aún no se han registrado costos suficientes")
                .deAdvertencia()
                .build()
            );
          }

          console.log("[ResumenCostosStore] State updated successfully");
        } catch (error: any) {
          console.error("[ResumenCostosStore] Error loading resumen:", error);

          const config = new ToastBuilder(error.message)
            .deError()
            .setTitulo("Error al Cargar Resumen")
            .build();
          toastService.show(config);

          patchState(store, {
            isLoading: false,
          });
        }
      },
    })
  )
);
