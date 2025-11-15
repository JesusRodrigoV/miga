import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MgScrollTop } from "@shared/components/mg-scroll-top";
import { Toast } from "primeng/toast";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, MgScrollTop, Toast],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected title = "miga";
}
