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
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

/**
 * Wrapper de UI para pInputText, estandarizado para usar Float Label 'on'.
 * Implementa ControlValueAccessor para ser compatible con Reactive Forms.
 *
 * @example
 * <mg-input
 * label="Nombre de Usuario"
 * formControlName="username"
 * [invalid]="form.get('username')?.invalid"
 * />
 */
@Component({
  selector: "mg-input",
  imports: [FormsModule, InputTextModule, FloatLabelModule],
  templateUrl: "./mg-input.html",
  styleUrl: "./mg-input.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MgInput),
      multi: true,
    },
  ],
})
export class MgInput implements ControlValueAccessor {
  protected value = signal<string | number | null>(null);
  protected disabled = signal<boolean>(false);
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  /** El texto para el Float Label. (Propiedad obligatoria) */
  label = input.required<string>();

  /** El tipo de input nativo. */
  type = input<"text" | "email" | "number">("text");

  /**
   * Define si el input debe ocupar el 100% del ancho.
   * @default false
   */
  fluid = input<boolean>(false);

  /**
   * Se usa para marcar el campo como inválido desde el componente padre.
   * @default false
   */
  invalid = input<boolean>(false);

  /** Un ID único para el input. Si no se provee, se genera uno. */
  id = input<string>();

  /** Autocompletado del navegador. */
  autocomplete = input<string>("off");

  /** Tamaño del input  */
  size = input<"small" | "large" | null>(null);

  /** Variante visual del input (PrimeNG). */
  variant = input<"outlined" | "filled">();

  /**
   * Genera un ID único para accesibilidad (conectar <label> con <input>)
   * si no se proveyó uno.
   */
  protected finalId = computed(
    () => this.id() ?? this.label().toLowerCase().replace(/\s/g, "-"),
  );

  writeValue(value: any): void {
    this.value.set(value);
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

  /** Notifica al formulario que el valor ha cambiado */
  protected onValueChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  /** Notifica al formulario que el control ha sido "tocado" */
  protected handleBlur() {
    this.onTouched();
  }
}
