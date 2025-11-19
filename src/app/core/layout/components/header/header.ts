import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";

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
})
export class Header {
  isLoading = input<boolean>(false);
  userName = input<string>("Usuario");
  onLogout = output<void>();

  currentPlanId = input<string | null>(null);

  links = computed<MenuItem[]>(() => {
    const menu: MenuItem[] = [
      { label: "Inicio", route: ["/inicio"] },
      { label: "Idea", route: ["/idea"] },
      { label: "Objetivo", route: ["/objetivo"] },
      { label: "Costos", route: ["/costos"] },
      { label: "Pon en marcha", route: ["/pon-en-marcha"] },
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

  logout() {
    this.onLogout.emit();
  }
}
