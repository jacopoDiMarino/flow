import { Fornitore } from '../models/fornitore';

export interface FatturaInterface {
  id: string;
  numeroFattura: string;
  dataEmissione: string;
  dataTrasmissione: string;
  dataInserimento: string;
  codiceFiscaleFornitore: string;
  pIvaFornitore: string;
  denominazioneFornitore: string;
  fornitore: Fornitore;
  imponibile: number;
  imposta: number;
}

export class Fattura implements FatturaInterface {
  id: string;
  numeroFattura: string;
  dataEmissione: string;
  dataTrasmissione: string;
  dataInserimento: string;
  codiceFiscaleFornitore: string;
  pIvaFornitore: string;
  denominazioneFornitore: string;
  fornitore: Fornitore;
  imponibile: number;
  imposta: number;

  constructor(fattura: FatturaInterface) {
    this.id = fattura.id;
    this.numeroFattura = fattura.numeroFattura;
    this.dataEmissione = fattura.dataEmissione;
    this.dataTrasmissione = fattura.dataTrasmissione;
    this.dataInserimento = fattura.dataInserimento;
    this.codiceFiscaleFornitore = fattura.codiceFiscaleFornitore;
    this.pIvaFornitore = fattura.pIvaFornitore;
    this.denominazioneFornitore = fattura.denominazioneFornitore;
    this.fornitore = fattura.fornitore;
    this.imponibile = fattura.imponibile;
    this.imposta = fattura.imposta;
  }
}
