import { inject } from "@angular/core";
import { PlanesService } from "../services";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ToastBuilder, ToastService } from "@shared/services/toast";
import { log } from "console";

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
  withMethods(
    (
      store,
      service = inject(PlanesService),
      toastService = inject(ToastService),
    ) => ({
      async cargarPlanes() {
        patchState(store, { isLoading: true });
        try {
          const data = await service.getPlanes();
          console.log("Data PDF:", data);
          patchState(store, { planes: data });
        } catch (error: any) {
          toastService.show(
            new ToastBuilder("Error al cargar planes").deError().build(),
          );
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async crearPlan() {
        patchState(store, { isLoading: true });
        try {
          const nuevo = await service.crearNuevoPlan();

          patchState(store, (state) => ({
            planes: [nuevo, ...state.planes],
          }));

          return nuevo;
        } catch (error: any) {
          toastService.show(
            new ToastBuilder("Error al crear plan").deError().build(),
          );
          throw error;
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      async eliminarPlan(planId: string) {
        try {
          await service.deletePlan(planId);

          patchState(store, (state) => ({
            planes: state.planes.filter((p) => p.id !== planId),
          }));

          toastService.show(
            new ToastBuilder("Plan eliminado").deExito().build(),
          );
        } catch (error: any) {
          toastService.show(
            new ToastBuilder("Error al eliminar").deError().build(),
          );
        }
      },

      async obtenerRutaContinuar(planId: string): Promise<string> {
        try {
          const ultimaSeccion = await service.getPlanProgress(planId);

          switch (ultimaSeccion) {
            case "objetivo":
              return "/objetivo";
            case "costos":
              return "/costos/materia-prima";
            case "mano-obra":
              return "/costos/mano-de-obra";
            case "costos-indirectos":
              return "/costos/costos-indirectos";
            case "resumen-costos":
              return "/costos/resumen";
            case "idea":
            default:
              return "/idea";
          }
        } catch (error) {
          console.error("Error obteniendo progreso, yendo a inicio", error);
          return "/idea";
        }
      },
    }),
  ),
);
