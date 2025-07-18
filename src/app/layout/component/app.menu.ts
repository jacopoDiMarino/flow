import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MenuItem } from "primeng/api";
import { AppMenuitem } from "./app.menuitem";

@Component({
  selector: "app-menu",
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
    <ng-container *ngFor="let item of model; let i = index">
      <li
        app-menuitem
        *ngIf="!item.separator"
        [item]="item"
        [index]="i"
        [root]="true"
      ></li>
      <li *ngIf="item.separator" class="menu-separator"></li>
    </ng-container>
  </ul> `,
})
export class AppMenu {
  model: MenuItem[] = [];

  ngOnInit() {
    this.model = [
      {
        label: "Home",
        items: [
          {
            label: "Dashboard",
            icon: "pi pi-fw pi-home",
            routerLink: ["/dashboard"],
          },
        ],
      },
      {
        label: "Conti",
        items: [
          {
            label: "Tabella",
            icon: "pi pi-fw pi-table",
            routerLink: ["/conti"],
          },
          {
            label: "Grafici",
            icon: "pi pi-fw pi-chart-bar",
            routerLink: ["/statistiche-conti"],
          },
        ],
      },
      {
        label: "Fatture",
        items: [
          {
            label: "Acquisto",
            icon: "pi pi-fw pi-users",
            routerLink: ["/fatture-acquisto"],
          },
          {
            label: "Vendita",
            icon: "pi pi-fw pi-users",
            routerLink: ["/fornidftori"],
          },
        ],
      },
      {
        label: "Pagine",
        items: [
          {
            label: "Corrispettivi",
            icon: "pi pi-fw pi-euro",
            routerLink: ["/corrispettivi"],
          },
          {
            label: "Personale",
            icon: "pi pi-fw pi-users",
            routerLink: ["/personale"],
          },
          {
            label: "Servizi",
            icon: "pi pi-fw pi-globe",
            routerLink: ["/servizi"],
          },
        ],
      },
      {
        label: "Impostazioni",
        items: [
          {
            label: "Fornitori",
            icon: "pi pi-fw pi-users",
            routerLink: ["/fornitori"],
          },
        ],
      },
      //   {
      //     label: 'UI Components',
      //     items: [
      //       {
      //         label: 'Form Layout',
      //         icon: 'pi pi-fw pi-id-card',
      //         routerLink: ['/uikit/formlayout'],
      //       },
      //       {
      //         label: 'Input',
      //         icon: 'pi pi-fw pi-check-square',
      //         routerLink: ['/uikit/input'],
      //       },
      //       {
      //         label: 'Button',
      //         icon: 'pi pi-fw pi-mobile',
      //         class: 'rotated-icon',
      //         routerLink: ['/uikit/button'],
      //       },
      //       {
      //         label: 'Table',
      //         icon: 'pi pi-fw pi-table',
      //         routerLink: ['/uikit/table'],
      //       },
      //       {
      //         label: 'List',
      //         icon: 'pi pi-fw pi-list',
      //         routerLink: ['/uikit/list'],
      //       },
      //       {
      //         label: 'Tree',
      //         icon: 'pi pi-fw pi-share-alt',
      //         routerLink: ['/uikit/tree'],
      //       },
      //       {
      //         label: 'Panel',
      //         icon: 'pi pi-fw pi-tablet',
      //         routerLink: ['/uikit/panel'],
      //       },
      //       {
      //         label: 'Overlay',
      //         icon: 'pi pi-fw pi-clone',
      //         routerLink: ['/uikit/overlay'],
      //       },
      //       {
      //         label: 'Media',
      //         icon: 'pi pi-fw pi-image',
      //         routerLink: ['/uikit/media'],
      //       },
      //       {
      //         label: 'Menu',
      //         icon: 'pi pi-fw pi-bars',
      //         routerLink: ['/uikit/menu'],
      //       },
      //       {
      //         label: 'Message',
      //         icon: 'pi pi-fw pi-comment',
      //         routerLink: ['/uikit/message'],
      //       },
      //       {
      //         label: 'File',
      //         icon: 'pi pi-fw pi-file',
      //         routerLink: ['/uikit/file'],
      //       },
      //       {
      //         label: 'Chart',
      //         icon: 'pi pi-fw pi-chart-bar',
      //         routerLink: ['/uikit/charts'],
      //       },
      //       {
      //         label: 'Timeline',
      //         icon: 'pi pi-fw pi-calendar',
      //         routerLink: ['/uikit/timeline'],
      //       },
      //       {
      //         label: 'Misc',
      //         icon: 'pi pi-fw pi-circle',
      //         routerLink: ['/uikit/misc'],
      //       },
      //     ],
      //   },
    ];
  }
}
