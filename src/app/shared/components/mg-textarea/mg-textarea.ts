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
import { MessageModule } from "primeng/message";
import { TextareaModule } from "primeng/textarea";

/**
 * pTextarea, estandarizado para usar Float Label 'on'.
 *
 * @example
 * <mg-textarea
 * label="Descripción"
 * formControlName="descripcion"
 * [rows]="5"
 * [autoResize]="true"
 * />
 */
@Component({
  selector: "mg-textarea",
  imports: [FormsModule, TextareaModule, FloatLabelModule, MessageModule],
  templateUrl: "./mg-textarea.html",
  styleUrl: "./mg-textarea.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MgTextarea),
      multi: true,
    },
  ],
})
export class MgTextarea implements ControlValueAccessor {
  protected value = signal<string | null>(null);
  protected disabled = signal<boolean>(false);
  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  /** El texto para el Float Label. (Propiedad obligatoria) */
  label = input.required<string>();

  /**
   * Habilita el auto-redimensionamiento vertical.
   * @default false
   */
  autoResize = input<boolean>(false);

  /**
   * Número de filas visibles.
   * @default 5
   */
  rows = input<number>(5);

  /**
   * Define si el textarea debe ocupar el 100% del ancho.
   * @default true
   */
  fluid = input<boolean>(false);

  /**
   * Se usa para marcar el campo como inválido desde el componente padre.
   * @default false
   */
  invalid = input<boolean>(false);

  /**
   * El mensaje de error a mostrar si el campo es inválido.
   */
  errorMessage = input<string>();

  /** Un ID único para el input. Si no se provee, se genera uno. */
  id = input<string>();

  /** Autocompletado del navegador. */
  autocomplete = input<string>("off");

  /**
   * Color del texto del label cuando está en reposo (dentro del input).
   * (Opcional) Ej: '#666666'
   */
  labelColor = input<string>();

  /**
   * Color del texto del label cuando está activo (flotando arriba) o tiene el foco.
   * (Opcional) Ej: '#ff0000'
   */
  activeLabelColor = input<string>();

  /** Genera un ID único para accesibilidad */
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

  protected onValueChange(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.value.set(value);
    this.onChange(value);
  }
  protected handleBlur() {
    this.onTouched();
  }
}
