import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule, ButtonProps, ButtonSeverity } from "primeng/button";
import { ButtonIconPos, ButtonSize, ButtonVariant } from "./models";

/**
 * Componente botón.
 *
 * Este componente estandariza el uso de botones  a través de la aplicación,
 * estableciendo valores predeterminados, fluid) y proveyendo
 * una API unificada para acciones (onClick) o navegación (routerLink).
 *
 * @example
 * * <mg-button label="Guardar" severity="success" (onClick)="onSave()"></mg-button>
 *
 * * <mg-button label="Ir a Home" [routerLink]="['/home']"></mg-button>
 *
 * * <mg-button label="Personalizado" [color]="'#8A2BE2'"></mg-button>
 */
@Component({
  selector: "mg-button",
  imports: [ButtonModule, RouterLink],
  templateUrl: "./mg-button.html",
  styleUrl: "./mg-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.fluid-wrapper]": "fluid()",
  },
})
export class MgButton {
  /** El texto a mostrar en el botón. (Propiedad obligatoria) */
  label = input<string>();

  /** El nombre del ícono (ej. 'pi pi-check'). */
  icon = input<string>();

  /**
   * Posición del ícono.
   * @default ButtonIconPos.LEFT
   */
  iconPos = input<ButtonIconPos>(ButtonIconPos.LEFT);

  /** Variante visual del botón (ej. 'text', 'outlined'). */
  variant = input<ButtonVariant>();

  /** Tamaño del botón (ej. 'small', 'large'). */
  size = input<ButtonSize>();

  /**
   * Estado de carga. Muestra un spinner y deshabilita el botón.
   * @default false
   */
  loading = input<boolean>(false);

  /**
   * Estado de deshabilitado.
   * @default false
   */
  disabled = input<boolean>(false);

  /**
   * Si se provee, renderiza el botón como un enlace de Angular Router.
   * La emisión de (onClick) será suprimida.
   */
  routerLink = input<string | any[]>();

  /**
   * Define si el botón tiene bordes completamente redondeados.
   * @default true
   */
  rounded = input<boolean>(true);

  /**
   * Define si el botón debe ocupar el 100% del ancho de su contenedor.
   * @default true
   */
  fluid = input<boolean>(true);

  /**
   * Emite el evento MouseEvent nativo al hacer clic.
   * No se emite si se ha proporcionado un valor para `routerLink`.
   */
  onClick = output<MouseEvent>();

  /**
   * (Opcional) Define un color personalizado (formato CSS, ej. '#FF0000').
   * Si se especifica, esta propiedad sobrescribe el input `severity`.
   */
  color = input<string>();

  /**
   * Severidad (color) predefinida de PrimeNG.
   * Se ignora si se provee la propiedad `color`.
   * @default 'primary' (si `color` no está definido)
   */
  severity = input<ButtonSeverity | null>(null);
  /**
   * (Opcional) Pasa atributos HTML nativos (como 'type')
   * directamente al elemento <button> interno.
   */
  buttonProps = input<ButtonProps>({});
  /**
   * @internal
   * Valor de severidad computado que se pasa a PrimeNG.
   * Prioriza 'color' (resultando en 'null') o usa 'severity',
   * con 'primary' como fallback.
   */
  finalSeverity = computed(() => {
    return this.color() ? null : (this.severity() ?? "primary");
  });
}
