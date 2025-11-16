import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { PlanesService } from "./services";
import { MgButton } from "@shared/components/mg-button";
import { ButtonSize } from "@shared/components/mg-button/models";
import { MgLoader } from "@shared/components/mg-loader";

@Component({
  selector: "app-planes",
  imports: [DatePipe, MgButton, MgLoader],
  templateUrl: "./planes.html",
  styleUrl: "./planes.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Planes {
  private router = inject(Router);
  private planesService = inject(PlanesService);
  size = ButtonSize.SMALL;

  planes = signal<any>([]);
  isLoading = signal<boolean>(false);

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const data = await this.planesService.getPlanes();
      this.planes.set(data);
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  async crearNuevoPlan() {
    this.isLoading.set(true);
    try {
      const nuevoPlan = await this.planesService.crearNuevoPlan();

      this.planes.update((planesActuales) => [...planesActuales, nuevoPlan]);

      this.router.navigate(["/idea"], {
        queryParams: { planId: nuevoPlan.id },
      });
    } catch (error) {
    } finally {
      this.isLoading.set(false);
    }
  }

  abrir(planId: string) {
    this.router.navigate(["/idea"], { queryParams: { planId } });
  }
}
