export interface Fornitore {
  id: string;
  ragioneSociale: string;
}

export class Fornitore implements Fornitore {
  id: string;
  ragioneSociale: string;

  constructor(fornitore: Fornitore) {
    this.id = fornitore.id;
    this.ragioneSociale = fornitore.ragioneSociale;
  }
}
