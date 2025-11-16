import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MgButton } from "@shared/components/mg-button";

@Component({
  selector: "mg-navbar",
  imports: [RouterLink, MgButton],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  isLoading = input<boolean>(false);
  userName = input<string>("Usuario");
  onLogout = output<void>();
  logout() {
    this.onLogout.emit();
  }
}
