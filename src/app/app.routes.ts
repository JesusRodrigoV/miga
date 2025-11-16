import { Routes } from "@angular/router";
import { authGuard } from "@core/guards/auth-guard";
import { publicGuard } from "@core/guards/public-guard";

export const routes: Routes = [
  //TODO: Revisar el nombre de las rutas
  {
    path: "",
    loadComponent: () => import("./core/layout/layout"),
    children: [
      {
        path: "inicio",
        title: "Inicio",
        loadComponent: () => import("./features/home/home"),
      },
      {
        path: "planes",
        title: "Planes",
        loadComponent: () => import("./features/planes/planes"),
        canActivate: [authGuard],
      },
      {
        path: "idea",
        title: "Idea",
        loadComponent: () => import("./features/idea/idea"),
        canActivate: [authGuard],
      },
      {
        path: "objetivo",
        title: "Objetivo",
        loadComponent: () => import("./features/objetivo/objetivo"),
        canActivate: [authGuard],
      },
      {
        path: "costos",
        title: "Costos",
        loadComponent: () =>
          import("./features/costos/components/costos/costos"),
        canActivate: [authGuard],
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
      {
        path: "",
        redirectTo: "inicio",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    canActivateChild: [publicGuard],
    children: [
      {
        path: "login",
        title: "Iniciar Sesión",
        loadComponent: () => import("./features/auth/login/login"),
      },
      {
        path: "signup",
        title: "Registro",
        loadComponent: () => import("./features/auth/signup/signup"),
      },
    ],
  },
  {
    path: "**",
    loadComponent: () => import("./core/errors/not-found/not-found"),
  },
];
