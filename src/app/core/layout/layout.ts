import {
  ChangeDetectionStrategy,
  Component,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { Footer, Header } from "./components";
import { Router, RouterOutlet } from "@angular/router";
import { AuthStore } from "@core/stores/auth.store";
import { StorageService } from "@core/services/storage-service";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, Header, Footer],
  templateUrl: "./layout.html",
  styleUrl: "./layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Layout {
  protected authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private storage = inject(StorageService);
  currentPlanId: string | null = null;

  async ngOnInit() {
    await this.authStore.loadSession();
    this.currentPlanId = this.storage.getItem("currentPlanId");
  }

  async handleLogout() {
    await this.authStore.logout();
    this.router.navigateByUrl("/login");
  }
}
