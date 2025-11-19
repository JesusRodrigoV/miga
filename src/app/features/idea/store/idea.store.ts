import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { IdeaService } from "../services";
import { ToastBuilder, ToastService } from "@shared/services/toast";

type IdeaState = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any | null;
};

const initialState: IdeaState = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const IdeaStore = signalStore(
  withState(initialState),
  withMethods(
    (store, service = inject(IdeaService), toast = inject(ToastService)) => ({
      async loadPageData(planIdFromRoute: string | null) {
        patchState(store, { isLoading: true, isSaved: false });
        try {
          const planId = await service.getOrCreatePlanId(planIdFromRoute);
          const data = await service.loadSection(planId);

          patchState(store, {
            planId: planId,
            initialData: data,
            isLoading: false,
          });
        } catch (error: any) {
          toast.show(
            new ToastBuilder(error.message)
              .deError()
              .setTitulo("Error al Cargar")
              .build(),
          );
          patchState(store, { isLoading: false });
        }
      },

      async saveIdea(formData: any) {
        patchState(store, { isLoading: true, isSaved: false });

        const planId = store.planId();
        if (!planId) {
          const errorMsg = "No hay ID de plan para guardar";
          toast.show(new ToastBuilder(errorMsg).deError().build());
          patchState(store, { isLoading: false });
          throw new Error(errorMsg);
        }

        try {
          await service.saveSection(planId, formData);
          patchState(store, {
            isLoading: false,
            isSaved: true,
          });

          toast.show(
            new ToastBuilder("Idea guardada con éxito").deExito().build(),
          );
        } catch (error: any) {
          patchState(store, { isLoading: false, isSaved: false });

          toast.show(
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
