import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ToastService, ToastBuilder } from "@shared/services/toast"; // Ajusta
import { PlanData } from "../services/plan-data";
import { PdfGenerator } from "../services/pdf-generator";

type PdfState = {
  isLoading: boolean;
  secciones: any;
  planId: string | null;
};

const initialState: PdfState = {
  isLoading: false,
  secciones: {},
  planId: null,
};

export const GenerarPdfStore = signalStore(
  withState(initialState),
  withMethods(
    (
      store,
      dataService = inject(PlanData),
      pdfService = inject(PdfGenerator),
      toast = inject(ToastService),
    ) => ({
      async loadData(planId: string) {
        patchState(store, { isLoading: true, planId });
        try {
          const secciones = await dataService.fetchAllSections(planId);
          patchState(store, { secciones, isLoading: false });
        } catch (error) {
          patchState(store, { isLoading: false });
          toast.show(
            new ToastBuilder("Error cargando datos").deError().build(),
          );
        }
      },

      generar() {
        const { planId, secciones } = store;
        if (!planId()) {
          toast.show(
            new ToastBuilder("No hay plan seleccionado").deError().build(),
          );
          return;
        }

        try {
          pdfService.generate(planId()!, secciones());
          toast.show(new ToastBuilder("PDF Generado").deExito().build());
        } catch (error) {
          toast.show(new ToastBuilder("Error generando PDF").deError().build());
        }
      },
    }),
  ),
);
