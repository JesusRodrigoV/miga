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
          patchState(store, {
            isLoading: false,
            isSaved: true,
          });
          const config = new ToastBuilder("Objetivos guardados con éxito")
            .deExito()
            .build();
          toastService.show(config);
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            isSaved: false,
          });
          const config = new ToastBuilder(error.message)
            .deError()
            .setTitulo("Error al Guardar")
            .build();
          toastService.show(config);
          throw error;
        }
      },
    }),
  ),
);
