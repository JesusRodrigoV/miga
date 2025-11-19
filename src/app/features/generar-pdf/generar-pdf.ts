import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GenerarPdfStore } from "./stores/pdf-generator.store";
import { MgButton } from "@shared/components/mg-button";

@Component({
  selector: "app-generar-pdf",
  imports: [MgButton],
  templateUrl: "./generar-pdf.html",
  styleUrl: "./generar-pdf.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GenerarPdfStore],
})
export default class GenerarPdf implements OnInit {
  private route = inject(ActivatedRoute);
  protected store = inject(GenerarPdfStore);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const planId = params["planId"];
      if (planId) {
        this.store.loadData(planId);
      }
    });
  }
}
