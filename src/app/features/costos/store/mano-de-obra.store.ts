import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { CostosService } from "../services/costos.service";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type ManoDeObraState = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any | null;
};

const initialState: ManoDeObraState = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const ManoDeObraStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(CostosService),
      toastService = inject(ToastService)
    ) => ({
      async loadPageData(planIdFromRoute: string | null) {
        console.log("[ManoDeObraStore] loadPageData called with planId:", planIdFromRoute);
        patchState(store, { isLoading: true });

        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          console.log("[ManoDeObraStore] Plan ID obtained:", planId);

          const data = await service.loadSection(planId, "mano-obra");
          console.log("[ManoDeObraStore] Section data loaded:", data);

          patchState(store, {
            planId: planId,
            initialData: data,
            isLoading: false,
          });

          console.log("[ManoDeObraStore] State updated successfully");
        } catch (error: any) {
          console.error("[ManoDeObraStore] Error loading data:", error);

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

      async saveManoDeObra(formData: any, outputs: any) {
        console.log("[ManoDeObraStore] saveManoDeObra called");
        console.log("[ManoDeObraStore] formData:", formData);
        console.log("[ManoDeObraStore] outputs:", outputs);

        patchState(store, { isLoading: true, isSaved: false });

        const planId = store.planId();
        if (!planId) {
          console.error("[ManoDeObraStore] No plan ID found");
          patchState(store, { isLoading: false });
          toastService.show(
            new ToastBuilder("No se encontró ID de plan").deError().build()
          );
          return;
        }

        try {
          await service.saveSection(planId, "mano-obra", formData, outputs);
          console.log("[ManoDeObraStore] Section saved successfully");

          try {
            await service.updatePlanProgress(planId, "mano-obra");
            console.log("[ManoDeObraStore] Plan progress updated");

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Mano de obra guardada con éxito")
                .deExito()
                .build()
            );
          } catch (updateError) {
            console.warn("[ManoDeObraStore] Failed to update plan progress", updateError);

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
          console.error("[ManoDeObraStore] Error saving:", error);

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
