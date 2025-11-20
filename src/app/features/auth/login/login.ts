import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthStore } from "@core/stores/auth.store";
import { MgButton } from "@shared/components/mg-button";
import { MgInput } from "@shared/components/mg-input";
import { MgPassword } from "@shared/components/mg-password";

@Component({
  selector: "app-login",
  imports: [RouterLink, ReactiveFormsModule, MgButton, MgPassword, MgInput],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authStore = inject(AuthStore);

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const { email, password } = this.form.value;

    try {
      await this.authStore.login({ email, password });

      this.router.navigateByUrl("/planes");
    } catch (error: any) {}
  }
}
