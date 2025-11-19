import { DatePipe, UpperCasePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";
import { ButtonIconPos, ButtonSize } from "@shared/components/mg-button/models";
import { PlanesStore } from "./stores";

@Component({
  selector: "app-planes",
  imports: [DatePipe, UpperCasePipe, MgButton],
  templateUrl: "./planes.html",
  styleUrl: "./planes.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PlanesStore],
})
export default class Planes implements OnInit {
  private router = inject(Router);
  protected planesStore = inject(PlanesStore);
  size = ButtonSize.SMALL;
  pos = ButtonIconPos.RIGHT;

  async ngOnInit() {
    await this.planesStore.cargarPlanes();
  }

  async crearNuevoPlan() {
    try {
      const nuevoPlan = await this.planesStore.crearPlan();
      this.router.navigate(["/idea"], {
        queryParams: { planId: nuevoPlan.id },
      });
    } catch (error) {}
  }

  async abrir(planId: string) {
    const rutaDestino = await this.planesStore.obtenerRutaContinuar(planId);

    this.router.navigate([rutaDestino], {
      queryParams: { planId },
    });
  }

  async eliminar(planId: string) {
    const confirmado = confirm("¿Estás seguro de eliminar este plan?");
    if (confirmado) {
      await this.planesStore.eliminarPlan(planId);
    }
  }
}
