import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthStore } from "@core/stores/auth.store";
import { MgScrollTop } from "@shared/components/mg-scroll-top";
import { MgToast } from "@shared/components/mg-toast";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, MgScrollTop, MgToast],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  private authStore = inject(AuthStore);

  async ngOnInit() {
    await this.authStore.loadSession();
  }
}
