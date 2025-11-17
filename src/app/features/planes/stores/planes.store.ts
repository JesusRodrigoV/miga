import { inject } from "@angular/core";
import { PlanesService } from "../services";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";

type PlanesState = {
  planes: any[];
  isLoading: boolean;
};

const initialState: PlanesState = {
  planes: [],
  isLoading: false,
};

export const PlanesStore = signalStore(
  withState(initialState),
  withMethods((store, service = inject(PlanesService)) => ({
    async cargarPlanes() {
      patchState(store, { isLoading: true });
      try {
        const data = await service.getPlanes();

        patchState(store, { planes: data });
      } finally {
        patchState(store, { isLoading: false });
      }
    },

    async crearPlan() {
      patchState(store, { isLoading: true });
      try {
        const nuevo = await service.crearNuevoPlan();
        patchState(store, (estadoActual) => ({
          planes: [...estadoActual.planes, nuevo],
        }));
        return nuevo;
      } finally {
        patchState(store, { isLoading: false });
      }
    },
  })),
);
