import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { Conto } from '../models/conto';

@Injectable({
  providedIn: 'root',
})
export class ContiService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
  ) {}

  url = 'http://localhost:3000/conti/';
  conti: BehaviorSubject<Conto[]> = new BehaviorSubject<Conto[]>([]);

  getConti() {
    this.http.get(this.url).subscribe({
      next: (res: any) => {
        console.log(res, 'conti get');
        this.conti.next(res.reverse());
        console.log('conti', this.conti.getValue());
        this.messageService.add({
          severity: 'info',
          key: 'BC',
          icon: 'pi pi-database',
          summary: 'Conti caricati',
          detail: 'I conti sono stati scaricati correttamente',
        });
      },
      error: (error: any) => {
        console.log(error, 'error get');
        this.messageService.add({
          severity: 'error',
          key: 'BC',
          icon: 'pi pi-database',
          life: 150000,
          summary: 'Errore caricamento',
          detail:
            'I conti non sono stati scaricati. Controlla lo stato del Server',
        });
      },
    });
  }

  addConto(conto: Conto) {
    this.http.post(this.url, conto).subscribe({
      next: (res: any) => {
        console.log(res, 'conto added');
        //aggiorno lista locale
        let conti = [res, ...this.conti.getValue()];
        this.conti.next(conti);
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-plus',
          summary: 'Conto aggiunto',
          detail: 'Conto aggiunto, lista aggiornata',
        });
      },
      error: (error: any) => {
        console.log(error, 'error add');
        this.messageService.add({
          severity: 'error',
          icon: 'pi pi-plus',
          life: 150000,
          summary: 'Errore aggiunta',
          detail:
            'Il conto non è stato aggiunto. Controlla lo stato del Server',
        });
      },
    });
  }

  updateConto(conto: Conto) {
    this.http.put(this.url + conto.id, conto).subscribe({
      next: (res: any) => {
        console.log(res, 'conto updated');
        // aggiorna la lista locale dei conti
        let conti = [...this.conti.getValue()];
        let idx = conti.findIndex((c) => c.id === res.id);
        if (idx > -1) {
          conti[idx] = res;
        }
        this.conti.next(conti);
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-file-edit',
          summary: 'Conto modificato',
          detail: 'Il conto è stato aggiornato correttamente',
        });
      },
      error: (error: any) => {
        console.log(error, 'error update');
        this.messageService.add({
          severity: 'error',
          icon: 'pi pi-file-edit',
          life: 150000,
          summary: 'Errore modifica',
          detail:
            'Il conto non è stato aggiornato correttamente. Controlla lo stato del Server e aggiorna la pagina per vedere i dati reali',
        });
      },
    });
  }

  deleteConto(id: string) {
    this.http.delete(this.url + id).subscribe({
      next: (res: any) => {
        console.log(res, 'conto deleted');
        let conti = [...this.conti.getValue()];
        conti = conti.filter((e) => e.id !== id);
        this.conti.next(conti);
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-trash',
          summary: 'Conto eliminato',
          detail: 'Il conto è stato eliminato correttamente',
        });
      },
      error: (error: any) => {
        console.log(error, 'error delete');
        this.messageService.add({
          severity: 'error',
          icon: 'pi pi-trash',
          life: 150000,
          summary: 'Errore eliminazione',
          detail:
            'Il conto non è stato eliminato. Controlla lo stato del Server',
        });
      },
    });
  }
}
