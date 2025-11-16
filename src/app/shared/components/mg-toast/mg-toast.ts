import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ToastModule } from "primeng/toast";

@Component({
  selector: "mg-toast",
  imports: [ToastModule],
  templateUrl: "./mg-toast.html",
  styleUrl: "./mg-toast.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MgToast {}
