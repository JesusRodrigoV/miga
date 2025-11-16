import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from "@angular/forms";
import { PasswordModule } from "primeng/password";
import { FloatLabelModule } from "primeng/floatlabel";
/**
 * Wrapper de UI para p-password, estandarizado para usar Float Label 'on'.
 * Implementa ControlValueAccessor para ser compatible con Reactive Forms.
 *
 * @example
 * * <mg-password
 * label="Contraseña"
 * formControlName="password"
 * />
 *
 * * <mg-password
 * label="Cree su contraseña"
 * formControlName="password"
 * [showMeter]="true"
 * />
 */
@Component({
  selector: "mg-password",
  imports: [PasswordModule, FloatLabelModule, FormsModule],
  templateUrl: "./mg-password.html",
  styleUrl: "./mg-password.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MgPassword),
      multi: true,
    },
  ],
})
export class MgPassword implements ControlValueAccessor {
  protected value = signal<string>("");
  protected disabled = signal<boolean>(false);
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  /** El texto para el Float Label. (Propiedad obligatoria) */
  label = input.required<string>();

  /**
   * Define si se muestra el medidor de fortaleza.
   */
  showMeter = input<boolean>(false);

  /** Un ID único para el input. Si no se provee, se genera uno. */
  id = input<string>();

  /**
   * Habilita un ícono para limpiar el contenido del input.
   * @default false
   */
  showClear = input<boolean>(false);

  /**
   * Define si el input debe ocupar el 100% del ancho.
   * @default true
   */
  fluid = input<boolean>(false);

  /**
   * Se usa para marcar el campo como inválido desde el componente padre.
   * @default false
   */
  invalid = input<boolean>(false);

  // --- Inputs de Locale (Español por defecto para el medidor) ---
  promptLabel = input<string>("Elija una contraseña");
  weakLabel = input<string>("Muy simple");
  mediumLabel = input<string>("Complejidad media");
  strongLabel = input<string>("Contraseña compleja");

  /**
   * Genera un ID único para accesibilidad (conectar <label> con <input>)
   * si no se proveyó uno.
   */
  protected finalId = computed(
    () => this.id() ?? this.label().toLowerCase().replace(/\s/g, "-"),
  );

  writeValue(value: any): void {
    this.value.set(value ?? "");
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onValueChange(value: string) {
    this.value.set(value);
    this.onChange(value);
  }

  protected handleBlur() {
    this.onTouched();
  }
}
