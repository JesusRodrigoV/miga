import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  CUSTOM_ELEMENTS_SCHEMA,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";
import { CommonModule } from "@angular/common";

interface MenuItem {
  label: string;
  route: string[];
  queryParams?: any;
}

@Component({
  selector: "mg-header",
  imports: [RouterLink, MgButton],
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

  currentPlanId = input<string | null>(null);

  links = computed<MenuItem[]>(() => {
    const menu: MenuItem[] = [
      { label: "Inicio", route: ["/inicio"] },
      { label: "Planes", route: ["/planes"] },
    ];

    const planId = this.currentPlanId();

    if (planId) {
      menu.push({
        label: "📄 Generar PDF",
        route: ["/generar-pdf"],
        queryParams: { planId: planId },
      });
    }

    return menu;
  });

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
