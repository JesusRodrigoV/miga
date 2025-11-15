export enum SeverityTypes {
  "SUCCESS" = "success",
  "INFO" = "info",
  "WARNING" = "warn",
  "ERROR" = "error",
}

export interface ToastConfig {
  severity: SeverityTypes;
  title: string;
  message: string;
  duration?: number;
  icon?: string;
  sticky?: boolean;
  position?: string;
}
