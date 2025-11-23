import { inject } from "@angular/core";
import { signalStore, withState, withMethods, patchState } from "@ngrx/signals";
import { ToastService, ToastBuilder } from "@shared/services/toast";
import { PlanData } from "../services/plan-data";
import { PdfGenerator } from "../services/pdf-generator";

type PdfState = {
  isLoading: boolean;
  currentPlanId: string | null;
};

const initialState: PdfState = {
  isLoading: false,
  currentPlanId: null,
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
      async generarParaPlan(planId: string) {
        patchState(store, { isLoading: true, currentPlanId: planId });

        try {
          const secciones = await dataService.fetchAllSections(planId);
          console.log("Data PDF secciones:", secciones);

          await pdfService.preloadLogos([
            "/logo1.png",
            "/logo5.jpg",
            "/logo6.jpg",
            "/logo4.png",
          ]);

          pdfService.generate(planId, secciones);


          toast.show(new ToastBuilder("PDF Generado").deExito().build());
        } catch (error: any) {
          toast.show(
            new ToastBuilder("Error al generar PDF").deError().build(),
          );
        } finally {
          patchState(store, { isLoading: false, currentPlanId: null });
        }
      },
    }),
  ),
);
