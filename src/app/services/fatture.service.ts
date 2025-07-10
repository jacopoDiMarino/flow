import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Fattura } from '../models/fattura';

@Injectable({
  providedIn: 'root',
})
export class FattureService {
  private _fatture = new BehaviorSubject<Fattura[]>([]);
  public fatture = this._fatture.asObservable();

  constructor() {
    // inizializzazione opzionale
    this._fatture.next([]);
  }

  addFattura(fattura: Fattura) {
    const updated = [...this._fatture.getValue(), fattura];
    this._fatture.next(updated);
  }

  updateFattura(fattura: Fattura) {
    const updated = this._fatture.getValue().map(f =>
      f.id === fattura.id ? fattura : f
    );
    this._fatture.next(updated);
  }

  deleteFattura(id: string) {
    const updated = this._fatture.getValue().filter(f => f.id !== id);
    this._fatture.next(updated);
  }

  setFatture(fatture: Fattura[]) {
    this._fatture.next(fatture);
  }
}
