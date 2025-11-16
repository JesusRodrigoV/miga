import { Routes } from "@angular/router";
import { authGuard } from "@core/guards/auth-guard";

export const routes: Routes = [
  //TODO: Revisar el nombre de las rutas
  {
    path: "login",
    loadComponent: () => import("./features/auth/login/login"),
  },
  {
    path: "registro",
    loadComponent: () => import("./features/auth/signup/signup"),
  },
  {
    path: "",
    loadComponent: () => import("./core/layout/layout"),
    children: [
      {
        path: "inicio",
        loadComponent: () => import("./features/home/home"),
      },
      {
        path: "planes",
        loadComponent: () => import("./features/planes/planes"),
        canActivate: [authGuard],
      },
      {
        path: "idea",
        loadComponent: () => import("./features/idea/idea"),
      },
      {
        path: "objetivo",
        loadComponent: () => import("./features/objetivo/objetivo"),
      },
      {
        path: "costos",
        loadComponent: () =>
          import("./features/costos/components/costos/costos"),
        children: [
          {
            path: "materia-prima",
            loadComponent: () =>
              import(
                "./features/costos/components/materia-prima/materia-prima"
              ),
          },
          {
            path: "mano-de-obra",
            loadComponent: () =>
              import("./features/costos/components/mano-de-obra/mano-de-obra"),
          },
          {
            path: "costos-indirectos",
            loadComponent: () =>
              import(
                "./features/costos/components/costos-indirectos/costos-indirectos"
              ),
          },
          {
            path: "resumen",
            loadComponent: () =>
              import(
                "./features/costos/components/resumen-costos/resumen-costos"
              ),
          },
          {
            path: "",
            redirectTo: "materia-prima",
            pathMatch: "full",
          },
        ],
      },
    ],
  },
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full",
  },
  {
    path: "**",
    redirectTo: "planes",
    pathMatch: "full",
    //loadComponent: () => import("./core/not-found/not-found"),
  },
];
