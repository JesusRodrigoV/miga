import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ButtonProps } from "primeng/button";
import { ScrollTop } from "primeng/scrolltop";

@Component({
  selector: "mg-scroll-top",
  imports: [ScrollTop],
  templateUrl: "./mg-scroll-top.html",
  styleUrl: "./mg-scroll-top.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MgScrollTop {
  customButtonProps: ButtonProps = {
    rounded: false,
    styleClass: "mg-custom-scrolltop",
  };
}
