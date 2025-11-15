import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from "@angular/forms";
import { Router } from "@angular/router";
import { AuthStore } from "@core/stores/auth.store";
import { supabase } from "@core/supabase.client";

@Component({
  selector: "app-login",
  imports: [ReactiveFormsModule],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  form: FormGroup;
  msg = "";
  modoLogin = false; // false = registrar, true = iniciar sesión

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
      if (this.modoLogin) {
        await this.authStore.login({ email, password });
      } else {
        await this.authStore.signup({ email, password }, nombre, apellido);
      }

      this.router.navigateByUrl("/planes");
    } catch (error: any) {
      this.msg = "❌ " + error.message;
    }
  }
}
