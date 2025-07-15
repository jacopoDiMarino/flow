import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FatturaAcquisto } from "../models/fattura-acquisto";
import { MessageService } from "primeng/api";
import { v4 as uuidv4 } from "uuid";

@Injectable({
  providedIn: "root",
})
export class FattureAcquistoService {
  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {}

  url = "http://localhost:3000/fattureAcquisto/";
  fattureAcquisto: BehaviorSubject<FatturaAcquisto[]> = new BehaviorSubject<
    FatturaAcquisto[]
  >([]);

  getFattureAcquisto() {
    this.http.get(this.url).subscribe({
      next: (res: any) => {
        console.log(res, "fatture acquisto get");
        this.fattureAcquisto.next(res.reverse());
        this.messageService.add({
          severity: "info",
          key: "BC",
          icon: "pi pi-database",
          summary: "Fatture acquisto caricate",
          detail: "Le fatture di acquisto sono state scaricate correttamente",
        });
      },
      error: (error: any) => {
        console.log(error, "error get");
        this.messageService.add({
          severity: "error",
          key: "BC",
          icon: "pi pi-database",
          life: 150000,
          summary: "Errore caricamento",
          detail:
            "Le fatture di acquisto non sono state scaricate. Controlla lo stato del Server",
        });
      },
    });
  }

  addFatturaAcquisto(fattura: FatturaAcquisto) {
    let fatturaAcquisto = new FatturaAcquisto({
      ...fattura,
      id: uuidv4(),
    });
    this.http.post(this.url, fatturaAcquisto).subscribe({
      next: (res: any) => {
        console.log(res, "fattura acquisto added");
        //aggiorno lista locale
        let fatture = [res, ...this.fattureAcquisto.getValue()];
        this.fattureAcquisto.next(fatture);
        this.messageService.add({
          severity: "success",
          icon: "pi pi-plus",
          summary: "Fattura acquisto aggiunta",
          detail: "Fattura di acquisto aggiunta, lista aggiornata",
        });
      },
      error: (error: any) => {
        console.log(error, "error add");
        this.messageService.add({
          severity: "error",
          icon: "pi pi-plus",
          life: 150000,
          summary: "Errore aggiunta",
          detail:
            "La fattura di acquisto non è stata aggiunta. Controlla lo stato del Server",
        });
      },
    });
  }

  updateFatturaAcquisto(fattura: FatturaAcquisto) {
    this.http.put(this.url + fattura.id, fattura).subscribe({
      next: (res: any) => {
        console.log(res, "fattura acquisto updated");
        this.fattureAcquisto.next(this.fattureAcquisto.getValue());
        this.messageService.add({
          severity: "success",
          icon: "pi pi-file-edit",
          summary: "Fattura acquisto modificata",
          detail: "La fattura di acquisto è stata aggiornata correttamente",
        });
      },
      error: (error: any) => {
        console.log(error, "error update");
        this.messageService.add({
          severity: "error",
          icon: "pi pi-file-edit",
          life: 150000,
          summary: "Errore modifica",
          detail:
            "La fattura di acquisto non è stata aggiornata correttamente. Controlla lo stato del Server e aggiorna la pagina per vedere i dati reali",
        });
      },
    });
  }

  deleteFatturaAcquisto(id: string) {
    this.http.delete(this.url + id).subscribe({
      next: (res: any) => {
        console.log(res, "fattura acquisto deleted");
        let fatture = [...this.fattureAcquisto.getValue()];
        fatture = fatture.filter((e) => e.id !== id);
        this.fattureAcquisto.next(fatture);
        this.messageService.add({
          severity: "success",
          icon: "pi pi-trash",
          summary: "Fattura acquisto eliminata",
          detail: "La fattura di acquisto è stata eliminata correttamente",
        });
      },
      error: (error: any) => {
        console.log(error, "error delete");
        this.messageService.add({
          severity: "error",
          icon: "pi pi-trash",
          life: 150000,
          summary: "Errore eliminazione",
          detail:
            "La fattura di acquisto non è stata eliminata. Controlla lo stato del Server",
        });
      },
    });
  }
}
