import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { CostosService } from "../services/costos.service";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type CostosIndirectosState = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any | null;
};

const initialState: CostosIndirectosState = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const CostosIndirectosStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(CostosService),
      toastService = inject(ToastService)
    ) => ({
      async loadPageData(planIdFromRoute: string | null) {
        console.log("[CostosIndirectosStore] loadPageData called with planId:", planIdFromRoute);
        patchState(store, { isLoading: true });

        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          console.log("[CostosIndirectosStore] Plan ID obtained:", planId);

          const data = await service.loadSection(planId, "costos-indirectos");
          console.log("[CostosIndirectosStore] Section data loaded:", data);

          patchState(store, {
            planId: planId,
            initialData: data,
            isLoading: false,
          });

          console.log("[CostosIndirectosStore] State updated successfully");
        } catch (error: any) {
          console.error("[CostosIndirectosStore] Error loading data:", error);

          const config = new ToastBuilder(error.message)
            .deError()
            .setTitulo("Error al Cargar")
            .build();
          toastService.show(config);

          patchState(store, {
            isLoading: false,
          });
        }
      },

      async saveCostosIndirectos(formData: any, outputs: any) {
        console.log("[CostosIndirectosStore] saveCostosIndirectos called");
        console.log("[CostosIndirectosStore] formData:", formData);
        console.log("[CostosIndirectosStore] outputs:", outputs);

        patchState(store, { isLoading: true, isSaved: false });

        const planId = store.planId();
        if (!planId) {
          console.error("[CostosIndirectosStore] No plan ID found");
          patchState(store, { isLoading: false });
          toastService.show(
            new ToastBuilder("No se encontró ID de plan").deError().build()
          );
          return;
        }

        try {
          await service.saveSection(planId, "costos-indirectos", formData, outputs);
          console.log("[CostosIndirectosStore] Section saved successfully");

          try {
            await service.updatePlanProgress(planId, "costos-indirectos");
            console.log("[CostosIndirectosStore] Plan progress updated");

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Costos indirectos guardados con éxito")
                .deExito()
                .build()
            );
          } catch (updateError) {
            console.warn("[CostosIndirectosStore] Failed to update plan progress", updateError);

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Guardado, pero no se actualizó el progreso")
                .deAdvertencia()
                .build()
            );
          }
        } catch (error: any) {
          console.error("[CostosIndirectosStore] Error saving:", error);

          patchState(store, {
            isLoading: false,
            isSaved: false,
          });

          toastService.show(
            new ToastBuilder(error.message)
              .deError()
              .setTitulo("Error al Guardar")
              .build()
          );
          throw error;
        }
      },
    })
  )
);
