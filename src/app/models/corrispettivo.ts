export interface CorrispettivoInterface {
  id: string;
  inseritoIl: Date | string;
  dataTransmissione: Date | string;
  imponibile: { contanti: number; elettronico: number };
  imposta: number;
}

export class Corrispettivo implements CorrispettivoInterface {
  id: string;
  inseritoIl: Date | string;
  dataTransmissione: Date | string;
  imponibile: { contanti: number; elettronico: number };
  imposta: number;
  constructor(corrispettivo: CorrispettivoInterface) {
    this.id = corrispettivo.id;
    this.inseritoIl = corrispettivo.inseritoIl;
    this.dataTransmissione = corrispettivo.dataTransmissione;
    this.imponibile = corrispettivo.imponibile;
    this.imposta = corrispettivo.imposta;
  }
}
// Aliquota.22

// imponibile deve essere compreso d'iva?  vedi il significato intriseco se cambiare poi nome
// e poi l'iva giu per non doversela ricalvolare ogni volta?
