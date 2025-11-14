import { Routes } from "@angular/router";

export const routes: Routes = [
  //TODO: Revisar el nombre de las rutas
  {
    path: "",
    loadComponent: () => import("./core/layout/layout"),
    children: [
      {
        path: "inicio",
        loadComponent: () => import("./features/home/home"),
      },
      {
        path: "",
        redirectTo: "/inicio",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "**",
    loadComponent: () => import("./core/not-found/not-found"),
  },
];
