import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  input,
  OnInit,
  output,
} from "@angular/core";
import { inject } from "@angular/core/primitives/di";
import { RouterLink } from "@angular/router";
import { supabase } from "@core/supabase.client";

@Component({
  selector: "mg-navbar",
  imports: [RouterLink],
  templateUrl: "./navbar.html",
  styleUrl: "./navbar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  userName = input<string>("Usuario");
  onLogout = output<void>();
  logout() {
    this.onLogout.emit();
  }
}
