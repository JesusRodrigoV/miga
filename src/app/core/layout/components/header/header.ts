import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";

@Component({
  selector: "mg-header",
  imports: [RouterLink, MgButton],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  isLoading = input<boolean>(false);
  userName = input<string>("Usuario");
  onLogout = output<void>();

  links = [
    { label: "Inicio", route: "/inicio" },
    { label: "Idea", route: "/idea" },
    { label: "Objetivo", route: "/objetivo" },
    { label: "Costos", route: "/costos" },
    { label: "Pon en marcha" },
  ];

  logout() {
    this.onLogout.emit();
  }
}
