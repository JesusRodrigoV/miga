import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-costos",
  imports: [RouterOutlet, RouterLink],
  templateUrl: "./costos.html",
  styleUrl: "./costos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Costos {
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.cdr.detectChanges(); // 👈 esto evita el error NG0100
  }
}
