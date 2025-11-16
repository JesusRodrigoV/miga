import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Footer, Navbar } from "./components";
import { Router, RouterOutlet } from "@angular/router";
import { supabase } from "@core/supabase.client";
import { AuthStore } from "@core/stores/auth.store";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: "./layout.html",
  styleUrl: "./layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Layout {
  protected authStore = inject(AuthStore);
  private readonly router = inject(Router);

  async ngOnInit() {
    await this.authStore.loadSession();
  }

  async handleLogout() {
    await this.authStore.logout();
    this.router.navigateByUrl("/login");
  }
}
