import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { FornitoriService } from './app/services/fornitori.service';
import { ContiService } from './app/services/conti.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ToastModule, ConfirmDialogModule],
  template: `<router-outlet></router-outlet> <p-toast></p-toast>
    <p-confirmDialog />`,
})
export class AppComponent {
  constructor(
    private fornitoriService: FornitoriService,
    private contiService: ContiService,
  ) {
    this.fornitoriService.getFornitori();
    this.contiService.getConti();
  }
}
