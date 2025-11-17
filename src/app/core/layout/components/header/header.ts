import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";
import { CommonModule } from "@angular/common";

@Component({
  selector: "mg-header",
  imports: [RouterLink, MgButton, CommonModule],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Header {
  isLoading = input<boolean>(false);
  userName = input<string | null>(null);
  onLogout = output<void>();

  isMenuOpen = false;

  links = [
    { label: "Inicio", route: "/inicio" },
    { label: "Planes", route: "/planes" },
  ];

  // Reemplaza estas URLs con tus imágenes reales
  logos = [
    { src: "/logo1.png", alt: "Logo 1" },
    { src: "/logo2.png", alt: "Logo 2" },
    { src: "/logo3.png", alt: "Logo 3" },
    { src: "/logo4.png", alt: "Logo 4" },
  ];

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.onLogout.emit();
    this.closeMenu();
  }
}
