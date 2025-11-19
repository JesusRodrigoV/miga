import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthStore } from "@core/stores/auth.store";
import { MgButton } from "@shared/components/mg-button";
import { MgInput } from "@shared/components/mg-input";
import { MgPassword } from "@shared/components/mg-password";

@Component({
  selector: "app-signup",
  imports: [ReactiveFormsModule, RouterLink, MgButton, MgPassword, MgInput],
  templateUrl: "./signup.html",
  styleUrl: "./signup.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Signup {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authStore = inject(AuthStore);

  form: FormGroup;
  msg = "";

  constructor() {
    this.form = this.fb.group({
      nombre: ["", Validators.required],
      apellido: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) return;

    this.msg = "";
    const { nombre, apellido, email, password } = this.form.value;

    try {
      await this.authStore.signup({ email, password }, nombre, apellido);

      this.router.navigateByUrl("/planes");
    } catch (error: any) {
      this.msg = "❌ " + error.message;
    }
  }
}
