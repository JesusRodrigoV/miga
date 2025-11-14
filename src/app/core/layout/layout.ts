import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Footer, Header } from "./components";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, Header, Footer],
  templateUrl: "./layout.html",
  styleUrl: "./layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Layout {}
