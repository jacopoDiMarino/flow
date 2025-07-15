import { Fornitore } from "./fornitore";

export interface FatturaAcquistoInterface {
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

export class FatturaAcquisto implements FatturaAcquistoInterface {
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

  constructor(fattura: FatturaAcquistoInterface) {
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
