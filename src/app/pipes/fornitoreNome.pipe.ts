import { Pipe, PipeTransform } from '@angular/core';
import { Fornitore } from '../models/fornitore';

@Pipe({ name: 'fornitoreNome', standalone: true })
export class FornitoreNomePipe implements PipeTransform {
  transform(id: string, fornitori: Fornitore[]): string {
    return (
      fornitori.find((f) => f.id === id)?.ragioneSociale.toUpperCase() || id
    );
  }
}
