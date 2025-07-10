import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fornitore } from '../models/fornitore';
import { MessageService } from 'primeng/api';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class FornitoriService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService,
  ) {}

  url = 'http://localhost:3000/fornitori/';
  fornitori: BehaviorSubject<Fornitore[]> = new BehaviorSubject<Fornitore[]>(
    [],
  );

  getFornitori() {
    this.http.get(this.url).subscribe({
      next: (res: any) => {
        console.log(res, 'fornitori get');
        this.fornitori.next(res.reverse());
        this.messageService.add({
          severity: 'info',
          key: 'BC',
          icon: 'pi pi-database',
          summary: 'Fornitori caricati',
          detail: 'I fornitori sono stati scaricati correttamente',
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
            'I fornitori non sono stati scaricati. Controlla lo stato del Server',
        });
      },
    });
  }

  addFornitore(ragioneSociale: string) {
    let fornitore = new Fornitore({
      id: uuidv4(),
      ragioneSociale: ragioneSociale,
    });
    this.http.post(this.url, fornitore).subscribe({
      next: (res: any) => {
        console.log(res, 'fornitore added');
        //aggiorno lista locale
        let fornitori = [res, ...this.fornitori.getValue()];
        this.fornitori.next(fornitori);
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-plus',
          summary: 'Fornitore aggiunto',
          detail: 'Fornitore aggiunto, lista aggiornata',
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
            'Il fornitore non è stato aggiunto. Controlla lo stato del Server',
        });
      },
    });
  }

  updateFornitore(forn: Fornitore) {
    this.http.put(this.url + forn.id, forn).subscribe({
      next: (res: any) => {
        console.log(res, 'fornitore updated');
        this.fornitori.next(this.fornitori.getValue());
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-file-edit',
          summary: 'Fornitore modificato',
          detail: 'Il fornitore è stato aggiornato correttamente',
        });
      },
      error: (error: any) => {
        console.log(error, 'error update');
        // this.fornitori.next(this.fornitori.getValue()); <--- serve davvero?
        this.messageService.add({
          severity: 'error',
          icon: 'pi pi-file-edit',
          life: 150000,
          summary: 'Errore modifica',
          detail:
            'Il fornitore non è stato aggiornato correttamente. Controlla lo stato del Server e aggiorna la pagina per vedere i dati reali',
        });
      },
    });
  }

  deleteFornitore(id: string) {
    this.http.delete(this.url + id).subscribe({
      next: (res: any) => {
        console.log(res, 'fornitore deleted');
        let fornitori = [...this.fornitori.getValue()];
        fornitori = fornitori.filter((e) => e.id !== id);
        this.fornitori.next(fornitori);
        this.messageService.add({
          severity: 'success',
          icon: 'pi pi-trash',
          summary: 'Fornitore eliminato',
          detail: 'Il fornitore è stato eliminato correttamente',
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
            'Il fornitore non è stato eliminato. Controlla lo stato del Server',
        });
      },
    });
  }
}
