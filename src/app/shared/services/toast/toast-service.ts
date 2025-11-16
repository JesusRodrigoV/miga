import { inject, Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { ToastConfig } from "./toast.model";

@Injectable({
  providedIn: "root",
})
export class ToastService {
  messageService = inject(MessageService);

  public show(config: ToastConfig) {
    this.messageService.add({
      severity: config.severity,
      summary: config.title,
      detail: config.message,
      life: config.duration,
      sticky: config.sticky,
      icon: config.icon,
    });
  }
}
