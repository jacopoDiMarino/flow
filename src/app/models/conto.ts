import { TipologiaConto } from '../enums/tipologiaConto.enum';

export interface ContoInterface {
  id: string;
  inseritoIl: Date | string;
  dataOperazione: Date | string;
  importo: number;
  idFornitore: string;
  tipologia: TipologiaConto;
  // documento: string,
  descrizione?: string;
}

export class Conto implements ContoInterface {
  id: string;
  inseritoIl: Date | string;
  dataOperazione: Date | string;
  importo: number;
  idFornitore: string;
  tipologia: TipologiaConto;
  descrizione?: string;

  constructor(conto: ContoInterface) {
    this.id = conto.id;
    this.inseritoIl = conto.inseritoIl;
    this.dataOperazione = conto.dataOperazione;
    this.importo = conto.importo;
    this.idFornitore = conto.idFornitore;
    this.tipologia = conto.tipologia;
    this.descrizione = conto.descrizione;
  }
}
