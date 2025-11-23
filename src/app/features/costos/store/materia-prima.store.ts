import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { CostosService } from "../services/costos.service";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type MateriaPrimaState = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any | null;
};

const initialState: MateriaPrimaState = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const MateriaPrimaStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(CostosService),
      toastService = inject(ToastService)
    ) => ({
      async loadPageData(planIdFromRoute: string | null) {
        console.log("[MateriaPrimaStore] loadPageData called with planId:", planIdFromRoute);
        patchState(store, { isLoading: true });

        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          console.log("[MateriaPrimaStore] Plan ID obtained:", planId);

          const data = await service.loadSection(planId, "costos");
          console.log("[MateriaPrimaStore] Section data loaded:", data);

          patchState(store, {
            planId: planId,
            initialData: data,
            isLoading: false,
          });

          console.log("[MateriaPrimaStore] State updated successfully");
        } catch (error: any) {
          console.error("[MateriaPrimaStore] Error loading data:", error);

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

      async saveMateriaPrima(formData: any, outputs: any) {
        console.log("[MateriaPrimaStore] saveMateriaPrima called");
        console.log("[MateriaPrimaStore] formData:", formData);
        console.log("[MateriaPrimaStore] outputs:", outputs);

        patchState(store, { isLoading: true, isSaved: false });

        const planId = store.planId();
        if (!planId) {
          console.error("[MateriaPrimaStore] No plan ID found");
          patchState(store, { isLoading: false });
          toastService.show(
            new ToastBuilder("No se encontró ID de plan").deError().build()
          );
          return;
        }

        try {
          await service.saveSection(planId, "costos", formData, outputs);
          console.log("[MateriaPrimaStore] Section saved successfully");

          try {
            await service.updatePlanProgress(planId, "costos");
            console.log("[MateriaPrimaStore] Plan progress updated");

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Materia prima guardada con éxito")
                .deExito()
                .build()
            );
          } catch (updateError) {
            console.warn("[MateriaPrimaStore] Failed to update plan progress", updateError);

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
          console.error("[MateriaPrimaStore] Error saving:", error);

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
