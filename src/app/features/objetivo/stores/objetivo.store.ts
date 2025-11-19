import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ObjetivoService } from "../services";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type ObjetivoState = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any | null;
};

const initialState: ObjetivoState = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const ObjetivoStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(ObjetivoService),
      toastService = inject(ToastService),
    ) => ({
      async loadPageData(planIdFromRoute: string | null) {
        patchState(store, { isLoading: true });
        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          const data = await service.loadSection(planId);

          patchState(store, {
            planId: planId,
            initialData: data,
            isLoading: false,
          });
        } catch (error: any) {
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

      async saveObjetivo(formData: any) {
        patchState(store, { isLoading: true, isSaved: false });

        const planId = store.planId();
        if (!planId) {
          patchState(store, { isLoading: false });
          toastService.show(
            new ToastBuilder("No se encontró ID de plan").deError().build(),
          );
          return;
        }

        try {
          await service.saveSection(planId, formData);

          try {
            await service.updatePlanProgress(planId);

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Objetivos guardados con éxito")
                .deExito()
                .build(),
            );
          } catch (updateError) {
            console.warn("Falló updatePlanProgress", updateError);

            patchState(store, {
              isLoading: false,
              isSaved: true,
            });

            toastService.show(
              new ToastBuilder("Guardado, pero no se actualizó el progreso")
                .deAdvertencia()
                .build(),
            );
          }
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            isSaved: false,
          });

          toastService.show(
            new ToastBuilder(error.message)
              .deError()
              .setTitulo("Error al Guardar")
              .build(),
          );
          throw error;
        }
      },
    }),
  ),
);
