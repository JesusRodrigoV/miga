import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-costos",
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: "./costos.html",
  styleUrl: "./costos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Costos {
  private cdr = inject(ChangeDetectorRef);
  costoLinks = [
    { route: "materia-prima", label: "Materia Prima" },
    { route: "mano-de-obra", label: "Mano de Obra Directa" },
    { route: "costos-indirectos", label: "Costos Indirectos" },
    { route: "resumen", label: "Resumen" },
  ];

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }
}
