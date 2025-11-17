import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ObjetivoStore } from "./stores";
import { MgLoader } from "@shared/components/mg-loader";
import { MgButton } from "@shared/components/mg-button";
import { MgTextarea } from "@shared/components/mg-textarea";
import { ButtonIconPos } from "@shared/components/mg-button/models";

@Component({
  selector: "app-objetivo",
  imports: [ReactiveFormsModule, RouterLink, MgButton, MgTextarea],
  templateUrl: "./objetivo.html",
  styleUrl: "./objetivo.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ObjetivoStore],
})
export default class Objetivo implements OnInit {
  form: FormGroup;
  pos = ButtonIconPos.RIGHT;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected readonly store = inject(ObjetivoStore);

  constructor() {
    this.form = this.fb.group({
      que: ["", Validators.required],
      aQuien: ["", Validators.required],
      cuando: ["", Validators.required],
      como: ["", Validators.required],
      donde: ["", Validators.required],
    });

    effect(() => {
      const data = this.store.initialData();
      if (data) {
        console.log("Parchando formulario con:", data);
        this.form.patchValue(data);
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      const planIdFromRoute = params["planId"] || null;
      await this.store.loadPageData(planIdFromRoute);
    });
  }

  async onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    try {
      await this.store.saveObjetivo(this.form.value);

      this.router.navigate(["/costos/materia-prima"], {
        queryParams: { planId: this.store.planId() },
      });
    } catch (error) {
      console.error("Fallo al guardar (manejado por el store)");
    }
  }

  public isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && control.touched;
  }
}
