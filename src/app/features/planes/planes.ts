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
    try {
      await this.planesStore.cargarPlanes();
    } catch (error) {
      console.error("Error al cargar planes", error);
    }
  }

  async crearNuevoPlan() {
    try {
      const nuevoPlan = await this.planesStore.crearPlan();

      this.router.navigate(["/idea"], {
        queryParams: { planId: nuevoPlan.id },
      });
    } catch (error) {
      console.error("Error al crear el plan", error);
    }
  }

  abrir(planId: string) {
    this.router.navigate(["/idea"], { queryParams: { planId } });
  }
}
