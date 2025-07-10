import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { FornitoriService } from '../../services/fornitori.service';
import { Fornitore } from '../../models/fornitore';
import { TipologiaConto } from '../../enums/tipologiaConto.enum';
import { SelectModule } from 'primeng/select';
import { ContiService } from '../../services/conti.service';
import { Conto } from '../../models/conto';
import { v4 as uuidv4 } from 'uuid';
import { DatePickerModule } from 'primeng/datepicker';
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgClass,
  NgFor,
  NgIf,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  TitleCasePipe,
  UpperCasePipe,
} from '@angular/common';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FornitoreNomePipe } from '../../pipes/fornitoreNome.pipe';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ScrollerModule } from 'primeng/scroller';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { TextareaModule } from 'primeng/textarea';

type IntervalKey =
  | 'meseCorrente'
  | 'mesePrecedente'
  | 'dueMesiFa'
  | 'restoAnnoCorrente'
  | 'annoPrecedente'
  | 'dueAnniFa'
  | 'primaDiTreAnniFa';

interface DateInterval {
  da: Date;
  a: Date;
}

@Component({
  selector: 'app-conti',
  templateUrl: './conti.component.html',
  styleUrls: ['./conti.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    AutoCompleteModule,
    SelectModule,
    DatePickerModule,
    AsyncPipe,
    InputNumberModule,
    CardModule,
    DatePipe,
    ButtonModule,
    FornitoreNomePipe,
    NgFor,
    NgIf,
    NgClass,
    DecimalPipe,
    IftaLabelModule,
    FloatLabelModule,
    ScrollerModule,
    UpperCasePipe,
    DialogModule,
    ConfirmDialogModule,
    PopoverModule,
    TextareaModule,
  ],
})
export class ContiComponent implements OnInit, OnDestroy {
  formConto!: FormGroup;
  displayDialog = false;
  editingConto: Conto | null = null;
  selectedFornitore?: Fornitore;
  fornitoriFiltrati: Fornitore[] = [];
  contiFiltrati: BehaviorSubject<Conto[]> = new BehaviorSubject<Conto[]>([]);
  contiSubscription: Subscription;
  fornitori: BehaviorSubject<Fornitore[]> = new BehaviorSubject<Fornitore[]>(
    [],
  );
  fornitoriSubscription: Subscription;
  oggi: Date = new Date();
  // variabili per filtri
  filtroDataInizio: Date | null = null;
  filtroDataFine: Date | null = null;
  filtroFornitore!: string | null;

  // variabili per riepilogo
  // 7 intervalli temporali
  intervals: Record<
    | 'meseCorrente'
    | 'mesePrecedente'
    | 'dueMesiFa'
    | 'restoAnnoCorrente'
    | 'annoPrecedente'
    | 'dueAnniFa'
    | 'primaDiTreAnniFa',
    { da: Date; a: Date }
  > = {
    meseCorrente: { da: new Date(), a: new Date() },
    mesePrecedente: { da: new Date(), a: new Date() },
    dueMesiFa: { da: new Date(), a: new Date() },
    restoAnnoCorrente: { da: new Date(), a: new Date() },
    annoPrecedente: { da: new Date(), a: new Date() },
    dueAnniFa: { da: new Date(), a: new Date() },
    primaDiTreAnniFa: { da: new Date(), a: new Date() },
  };

  intervalOrder: (keyof typeof this.intervals)[] = [
    'primaDiTreAnniFa',
    'dueAnniFa',
    'annoPrecedente',
    'restoAnnoCorrente',
    'dueMesiFa',
    'mesePrecedente',
    'meseCorrente',
  ];

  // Totali per bucket
  summary: Record<
    keyof typeof this.intervals,
    { netAcquisti: number; pagamenti: number }
  > = {
    meseCorrente: { netAcquisti: 0, pagamenti: 0 },
    mesePrecedente: { netAcquisti: 0, pagamenti: 0 },
    dueMesiFa: { netAcquisti: 0, pagamenti: 0 },
    restoAnnoCorrente: { netAcquisti: 0, pagamenti: 0 },
    annoPrecedente: { netAcquisti: 0, pagamenti: 0 },
    dueAnniFa: { netAcquisti: 0, pagamenti: 0 },
    primaDiTreAnniFa: { netAcquisti: 0, pagamenti: 0 },
  };

  // Totali complessivi e debito
  totaleNetAcquisti = 0;
  totalePagamenti = 0;
  debitoResiduo = 0;

  constructor(
    public fornitoriService: FornitoriService,
    public contiService: ContiService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
  ) {
    this.contiSubscription = this.contiService.conti.subscribe((res) => {
      // this.contiFiltrati.next(res);
      this.filtraConti();
      console.log('conti recuperati');
    });
    this.fornitoriSubscription = this.fornitoriService.fornitori.subscribe(
      (res) => {
        this.fornitori.next(res);
        console.log('fornitori recuperati');
      },
    );
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.formConto = this.fb.group({
      dataOperazione: [null, Validators.required],
      tipologia: [null, Validators.required],
      idFornitore: [null, Validators.required],
      importo: [0, [Validators.required, Validators.min(0.01)]],
      descrizione: [''],
    });
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
      message: 'Sei sicuro di voler eliminare questo conto?',
      header: 'Confermi eliminazione?',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Elimina',
      },
      rejectButtonProps: {
        label: 'Annulla',
        severity: 'secondary',
        text: true,
      },
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      closable: false,
      defaultFocus: 'reject',
      accept: () => {
        this.contiService.deleteConto(id);
      },
      reject: () => {},
    });
  }

  showDialogConto(conto?: Conto) {
    this.editingConto = conto ?? null;

    if (conto) {
      // MODIFICA: patch con i valori esistenti
      this.formConto.patchValue({
        dataOperazione: new Date(conto.dataOperazione),
        tipologia: conto.tipologia,
        idFornitore: conto.idFornitore,
        importo: conto.importo,
        descrizione: conto.descrizione,
      });
    } else {
      // NUOVO: reset mantenendo fornitore dal filtro se presente
      this.formConto.reset({
        dataOperazione: null,
        tipologia: null,
        idFornitore: this.filtroFornitore || null,
        importo: 0,
        descrizione: '',
      });
    }

    this.displayDialog = true;
  }

  // al click di “Salva”
  salvaConto() {
    if (this.formConto.invalid) {
      this.formConto.markAllAsTouched();
      return;
    }
    const v = this.formConto.value;
    const payload: Conto = {
      id: this.editingConto?.id || uuidv4(),
      inseritoIl: this.editingConto
        ? this.editingConto.inseritoIl
        : new Date().toISOString(),
      dataOperazione: v.dataOperazione.toISOString(),
      tipologia: v.tipologia,
      idFornitore: v.idFornitore,
      importo: v.importo,
      descrizione: v.descrizione,
    };

    if (this.editingConto) {
      this.contiService.updateConto(payload);
    } else {
      this.contiService.addConto(payload);
    }
    this.filtraConti();
    this.displayDialog = false;
  }

  // quando chiudo il dialog — pulisco
  onDialogHide() {
    this.formConto.reset();
    this.editingConto = null;
  }

  // per pololare e filtrare l'autocomplete fornitori
  filtraFornitori(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    let fornitori = [...this.fornitoriService.fornitori.getValue()];
    this.fornitoriFiltrati = fornitori.filter((f) =>
      f.ragioneSociale.toLowerCase().includes(query),
    );
  }
  // per popolare il select tipologia
  getTipologieConto(): string[] {
    return Object.values(TipologiaConto);
  }

  filtraConti() {
    let conti = [...this.contiService.conti.getValue()];

    if (this.filtroFornitore) {
      conti = conti.filter((c) => c.idFornitore === this.filtroFornitore);
    }

    if (this.filtroDataInizio !== null) {
      conti = conti.filter(
        (c) => new Date(c.dataOperazione) >= this.filtroDataInizio!,
      );
    }

    if (this.filtroDataFine !== null) {
      conti = conti.filter(
        (c) => new Date(c.dataOperazione) <= this.filtroDataFine!,
      );
    }

    conti.sort(
      (a, b) =>
        new Date(b.dataOperazione).getTime() -
        new Date(a.dataOperazione).getTime(),
    );

    this.contiFiltrati.next(conti);
    this.calcolaRipartizioneTemporale();
  }

  calcolaRipartizioneTemporale() {
    const conti = this.contiFiltrati.getValue();
    const oggi = new Date();
    const Y = oggi.getFullYear(),
      M = oggi.getMonth();

    // 1) Definizione intervalli
    this.intervals.meseCorrente = {
      da: new Date(Y, M, 1),
      a: oggi,
    };
    this.intervals.mesePrecedente = {
      da: new Date(Y, M - 1, 1),
      a: new Date(Y, M, 0),
    };
    this.intervals.dueMesiFa = {
      da: new Date(Y, M - 2, 1),
      a: new Date(Y, M - 1, 0),
    };
    this.intervals.restoAnnoCorrente = {
      da: new Date(Y, 0, 1),
      a: new Date(Y, M - 2, 0),
    };
    this.intervals.annoPrecedente = {
      da: new Date(Y - 1, 0, 1),
      a: new Date(Y - 1, 11, 31),
    };
    this.intervals.dueAnniFa = {
      da: new Date(Y - 2, 0, 1),
      a: new Date(Y - 2, 11, 31),
    };
    this.intervals.primaDiTreAnniFa = {
      da: new Date(2000, 0, 1),
      a: new Date(Y - 3, 11, 31),
    };

    // 2) Azzeramento totali
    for (const key of Object.keys(this.summary) as Array<
      keyof typeof this.summary
    >) {
      this.summary[key] = { netAcquisti: 0, pagamenti: 0 };
    }

    // 3) Assegna ogni conto al bucket giusto
    for (const c of conti) {
      const d = new Date(c.dataOperazione).getTime();
      for (const key of Object.keys(this.intervals) as Array<
        keyof typeof this.intervals
      >) {
        const { da, a } = this.intervals[key];
        if (d >= da.getTime() && d <= a.getTime()) {
          if (c.tipologia === 'ACQUISTO') {
            this.summary[key].netAcquisti += c.importo;
          } else if (c.tipologia === 'RIMBORSO') {
            this.summary[key].netAcquisti -= c.importo;
          } else if (c.tipologia === 'PAGAMENTO') {
            this.summary[key].pagamenti += c.importo;
          }
          break;
        }
      }
    }

    // 4) Totali complessivi e debito
    this.totaleNetAcquisti = Object.values(this.summary).reduce(
      (sum, b) => sum + b.netAcquisti,
      0,
    );
    this.totalePagamenti = Object.values(this.summary).reduce(
      (sum, b) => sum + b.pagamenti,
      0,
    );
    this.debitoResiduo = this.totaleNetAcquisti - this.totalePagamenti;
  }

  resetFiltri() {
    this.filtroFornitore = null;
    this.filtroDataInizio = null;
    this.filtroDataFine = null;
    this.filtraConti();
  }

  ngOnDestroy(): void {
    this.contiSubscription.unsubscribe();
    this.fornitoriSubscription.unsubscribe();
  }
}
