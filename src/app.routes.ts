import { Routes } from "@angular/router";
import { AppLayout } from "./app/layout/component/app.layout";

export const appRoutes: Routes = [
  {
    path: "",
    component: AppLayout,
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./app/pages/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "conti",
        loadComponent: () =>
          import("./app/pages/conti/conti.component").then(
            (m) => m.ContiComponent
          ),
      },
      {
        path: "statistiche-conti",
        loadComponent: () =>
          import(
            "./app/pages/statisticheConti/statisticheConti.component"
          ).then((m) => m.StatisticheContiComponent),
      },
      {
        path: "fornitori",
        loadComponent: () =>
          import("./app/pages/fornitori/fornitori.component").then(
            (m) => m.FornitoriComponent
          ),
      },
      {
        path: "corrispettivi",
        loadComponent: () =>
          import("./app/pages/corrispettivi/corrispettivi.component").then(
            (m) => m.CorrispettiviComponent
          ),
      },
      {
        path: "fatture-acquisto",
        loadComponent: () =>
          import(
            "./app/pages/fatture-acquisto/fatture-acquisto.component"
          ).then((m) => m.FattureAcquistoComponent),
      },
    ],
  },
  { path: "**", redirectTo: "/notfound" },
];
