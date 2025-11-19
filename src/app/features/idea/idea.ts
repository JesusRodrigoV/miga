import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { IdeaStore } from "./store";
import { MgButton } from "@shared/components/mg-button";
import { MgTextarea } from "@shared/components/mg-textarea";
import { MgInput } from "@shared/components/mg-input";
import { ButtonIconPos } from "@shared/components/mg-button/models";

@Component({
  selector: "app-idea",
  imports: [ReactiveFormsModule, RouterLink, MgButton, MgTextarea, MgInput],
  templateUrl: "./idea.html",
  styleUrl: "./idea.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IdeaStore],
})
export default class Idea {
  form: FormGroup;
  pos = ButtonIconPos.RIGHT;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  protected readonly store = inject(IdeaStore);

  constructor() {
    this.form = this.fb.group({
      fortalezas: ["", Validators.required],
      oportunidades: ["", Validators.required],
      ideaNegocio: ["", Validators.required],
      nombreNegocio: ["", Validators.required],
      propuestaValor: ["", Validators.required],
      motivacion: ["", Validators.required],
    });

    effect(() => {
      const data = this.store.initialData();
      if (data) {
        this.form.patchValue(data, { emitEvent: false });
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
      await this.store.saveIdea(this.form.value);
    } catch (error) {}
  }

  public isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }
    return control.invalid && control.touched;
  }
}
