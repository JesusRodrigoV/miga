import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { PonEnMarchaStore } from "./stores/pon-en-marcha.store";
import { MgTextarea } from "@shared/components/mg-textarea";
import { MgButton } from "@shared/components/mg-button";
import { MgLoader } from "@shared/components/mg-loader";

@Component({
  selector: "app-pon-en-marcha",
  imports: [ReactiveFormsModule, RouterLink, MgTextarea, MgButton, MgLoader],
  templateUrl: "./pon-en-marcha.html",
  styleUrl: "./pon-en-marcha.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PonEnMarchaStore],
})
export default class PonEnMarcha implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected store = inject(PonEnMarchaStore);

  form = this.fb.group({
    aliados: ["", Validators.required],
    clientes: ["", Validators.required],
    competencia: ["", Validators.required],
    puntosDistribucion: ["", Validators.required],
    mercadeo: ["", Validators.required],
  });

  constructor() {
    effect(() => {
      if (this.store.initialData()) {
        this.form.patchValue(this.store.initialData(), { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((p) => this.store.load(p["planId"]));
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.store.save(this.form.value);
    }
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!(c?.invalid && c?.touched);
  }
}
