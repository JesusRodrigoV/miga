import { SeverityTypes, ToastConfig } from "./toast.model";

export class ToastBuilder {
  private config: Partial<ToastConfig> = {};

  constructor(message: string) {
    this.config.message = message;
    this.config.duration = 3000;
    this.config.title = "Notificacion";
    this.config.severity = SeverityTypes.INFO;
  }

  setTitulo(title: string): this {
    this.config.title = title;
    return this;
  }

  deExito(): this {
    this.config.severity = SeverityTypes.SUCCESS;
    this.config.title = "Exito";
    this.config.icon = "pi pi-check";
    return this;
  }

  deError(): this {
    this.config.severity = SeverityTypes.ERROR;
    this.config.title = "Error";
    this.config.icon = "pi pi-times";
    return this;
  }

  deAdvertencia(): this {
    this.config.severity = SeverityTypes.WARNING;
    this.config.title = "Advertencia";
    this.config.icon = "pi pi-exclamation-triangle";
    return this;
  }

  setDuracion(duration: number): this {
    this.config.duration = duration;
    return this;
  }

  setPermanencia(): this {
    this.config.duration = undefined;
    this.config.sticky = true;
    return this;
  }

  setIcono(icono: string): this {
    this.config.icon = icono;
    return this;
  }

  build(): ToastConfig {
    return this.config as ToastConfig;
  }
}
