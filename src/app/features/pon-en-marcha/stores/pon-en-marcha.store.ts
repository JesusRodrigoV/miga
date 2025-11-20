import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ToastBuilder, ToastService } from "@shared/services/toast";
import { PonEnMarchaService } from "../services/pon-en-marcha-service";

type State = {
  isLoading: boolean;
  isSaved: boolean;
  planId: string | null;
  initialData: any;
};
const initialState: State = {
  isLoading: true,
  isSaved: false,
  planId: null,
  initialData: null,
};

export const PonEnMarchaStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(PonEnMarchaService),
      toast = inject(ToastService),
    ) => ({
      async load(routeId: string | null) {
        patchState(store, { isLoading: true });
        try {
          const id = await service.getOrCreatePlanId(routeId);
          const { data } = await service.loadSection(id);
          patchState(store, {
            planId: id,
            initialData: data?.inputs_json,
            isLoading: false,
          });
        } catch (e) {
          patchState(store, { isLoading: false });
        }
      },

      async save(formValue: any) {
        patchState(store, { isLoading: true });
        try {
          if (!store.planId()) throw new Error("No plan ID");
          await service.save(store.planId()!, formValue);

          patchState(store, { isLoading: false, isSaved: true });
          toast.show(
            new ToastBuilder("¡Plan finalizado con éxito!").deExito().build(),
          );
        } catch (e: any) {
          patchState(store, { isLoading: false });
          toast.show(new ToastBuilder(e.message).deError().build());
        }
      },
    }),
  ),
);
