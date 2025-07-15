import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from "primeng/autocomplete";
import { FornitoriService } from "../../services/fornitori.service";
import { FattureAcquistoService } from "../../services/fatture-acquisto.service";
import { Fornitore } from "../../models/fornitore";
import { FatturaAcquisto } from "../../models/fattura-acquisto";
import { DatePickerModule } from "primeng/datepicker";
import {
  AsyncPipe,
  DatePipe,
  DecimalPipe,
  NgFor,
  NgIf,
  TitleCasePipe,
  UpperCasePipe,
  CommonModule,
} from "@angular/common";
import { BehaviorSubject, Subscription } from "rxjs";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { FornitoreNomePipe } from "../../pipes/fornitoreNome.pipe";
import { IftaLabelModule } from "primeng/iftalabel";
import { FloatLabelModule } from "primeng/floatlabel";
import { ScrollerModule } from "primeng/scroller";
import { DialogModule } from "primeng/dialog";
import { InputNumberModule } from "primeng/inputnumber";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { PopoverModule } from "primeng/popover";
import { TextareaModule } from "primeng/textarea";
import { SelectModule } from "primeng/select";
import { TooltipModule } from "primeng/tooltip";
import { v4 as uuidv4 } from "uuid";

type IntervalKey =
  | "meseCorrente"
  | "mesePrecedente"
  | "dueMesiFa"
  | "restoAnnoCorrente"
  | "annoPrecedente"
  | "dueAnniFa"
  | "primaDiTreAnniFa";

interface DateInterval {
  da: Date;
  a: Date;
}

@Component({
  selector: "app-fatture-acquisto",
  templateUrl: "./fatture-acquisto.component.html",
  styleUrls: ["./fatture-acquisto.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
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
    DecimalPipe,
    IftaLabelModule,
    FloatLabelModule,
    ScrollerModule,
    UpperCasePipe,
    DialogModule,
    ConfirmDialogModule,
    PopoverModule,
    TextareaModule,
    TooltipModule,
  ],
})
export class FattureAcquistoComponent implements OnInit, OnDestroy {
  formFattura!: FormGroup;
  displayDialog = false;
  editingFattura: FatturaAcquisto | null = null;
  selectedFornitore?: Fornitore;
  fornitoriFiltrati: Fornitore[] = [];
  fattureFiltrate: BehaviorSubject<FatturaAcquisto[]> = new BehaviorSubject<
    FatturaAcquisto[]
  >([]);
  fattureSubscription: Subscription;
  fornitori: BehaviorSubject<Fornitore[]> = new BehaviorSubject<Fornitore[]>(
    []
  );
  fornitoriSubscription: Subscription;
  oggi: Date = new Date();

  // variabili per filtri
  filtroDataEmissioneInizio: Date | null = null;
  filtroDataEmissioneFine: Date | null = null;
  filtroDataTrasmissioneInizio: Date | null = null;
  filtroDataTrasmissioneFine: Date | null = null;
  filtroDataInserimentoInizio: Date | null = null;
  filtroDataInserimentoFine: Date | null = null;
  filtroFornitore!: string | null;
  filtroNumeroFattura: string = "";

  // Stato per filtri avanzati
  showFiltriAvanzati: boolean = false;

  // variabili per riepilogo
  // 7 intervalli temporali
  intervals: Record<
    | "meseCorrente"
    | "mesePrecedente"
    | "dueMesiFa"
    | "restoAnnoCorrente"
    | "annoPrecedente"
    | "dueAnniFa"
    | "primaDiTreAnniFa",
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
    "primaDiTreAnniFa",
    "dueAnniFa",
    "annoPrecedente",
    "restoAnnoCorrente",
    "dueMesiFa",
    "mesePrecedente",
    "meseCorrente",
  ];

  // Totali per bucket
  summary: Record<
    keyof typeof this.intervals,
    { imponibile: number; imposta: number; totale: number }
  > = {
    meseCorrente: { imponibile: 0, imposta: 0, totale: 0 },
    mesePrecedente: { imponibile: 0, imposta: 0, totale: 0 },
    dueMesiFa: { imponibile: 0, imposta: 0, totale: 0 },
    restoAnnoCorrente: { imponibile: 0, imposta: 0, totale: 0 },
    annoPrecedente: { imponibile: 0, imposta: 0, totale: 0 },
    dueAnniFa: { imponibile: 0, imposta: 0, totale: 0 },
    primaDiTreAnniFa: { imponibile: 0, imposta: 0, totale: 0 },
  };

  // Totali complessivi
  totaleImponibile = 0;
  totaleImposta = 0;
  totaleFatture = 0;

  constructor(
    public fornitoriService: FornitoriService,
    public fattureAcquistoService: FattureAcquistoService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.fattureSubscription =
      this.fattureAcquistoService.fattureAcquisto.subscribe((res) => {
        this.filtraFatture();
        console.log("fatture recuperate");
      });
    this.fornitoriSubscription = this.fornitoriService.fornitori.subscribe(
      (res) => {
        this.fornitori.next(res);
        console.log("fornitori recuperati");
      }
    );
  }

  ngOnInit() {
    this.initForm();
    this.fornitoriService.getFornitori();
    this.fattureAcquistoService.getFattureAcquisto();
  }

  private initForm() {
    this.formFattura = this.fb.group({
      numeroFattura: ["", Validators.required],
      dataEmissione: [null, Validators.required],
      dataTrasmissione: [null, Validators.required],
      codiceFiscaleFornitore: ["", Validators.required],
      pIvaFornitore: ["", Validators.required],
      denominazioneFornitore: ["", Validators.required],
      fornitore: [null, Validators.required],
      imponibile: [0, [Validators.required, Validators.min(0.01)]],
      imposta: [0, [Validators.required, Validators.min(0)]],
    });
  }

  confirmDelete(id: string) {
    this.confirmationService.confirm({
      message: "Sei sicuro di voler eliminare questa fattura di acquisto?",
      header: "Confermi eliminazione?",
      icon: "pi pi-exclamation-triangle",
      acceptButtonProps: {
        label: "Elimina",
      },
      rejectButtonProps: {
        label: "Annulla",
        severity: "secondary",
        text: true,
      },
      acceptIcon: "pi pi-check",
      rejectIcon: "pi pi-times",
      closable: false,
      defaultFocus: "reject",
      accept: () => {
        this.fattureAcquistoService.deleteFatturaAcquisto(id);
      },
      reject: () => {},
    });
  }

  showDialogFattura(fattura?: FatturaAcquisto) {
    this.editingFattura = fattura ?? null;

    if (fattura) {
      // MODIFICA: patch con i valori esistenti
      this.formFattura.patchValue({
        numeroFattura: fattura.numeroFattura,
        dataEmissione: new Date(fattura.dataEmissione),
        dataTrasmissione: new Date(fattura.dataTrasmissione),
        codiceFiscaleFornitore: fattura.codiceFiscaleFornitore,
        pIvaFornitore: fattura.pIvaFornitore,
        denominazioneFornitore: fattura.denominazioneFornitore,
        fornitore: fattura.fornitore,
        imponibile: fattura.imponibile,
        imposta: fattura.imposta,
      });
    } else {
      // NUOVO: reset form
      this.formFattura.reset({
        numeroFattura: "",
        dataEmissione: null,
        dataTrasmissione: null,
        codiceFiscaleFornitore: "",
        pIvaFornitore: "",
        denominazioneFornitore: "",
        fornitore: null,
        imponibile: 0,
        imposta: 0,
      });
    }

    this.displayDialog = true;
  }

  // al click di "Salva"
  salvaFattura() {
    if (this.formFattura.invalid) {
      this.formFattura.markAllAsTouched();
      return;
    }
    const v = this.formFattura.value;
    const payload: FatturaAcquisto = {
      id: this.editingFattura?.id || uuidv4(),
      numeroFattura: v.numeroFattura,
      dataEmissione: v.dataEmissione.toISOString(),
      dataTrasmissione: v.dataTrasmissione.toISOString(),
      dataInserimento: this.editingFattura
        ? this.editingFattura.dataInserimento
        : new Date().toISOString(),
      codiceFiscaleFornitore: v.codiceFiscaleFornitore,
      pIvaFornitore: v.pIvaFornitore,
      denominazioneFornitore: v.denominazioneFornitore,
      fornitore: v.fornitore,
      imponibile: v.imponibile,
      imposta: v.imposta,
    };

    if (this.editingFattura) {
      this.fattureAcquistoService.updateFatturaAcquisto(payload);
    } else {
      this.fattureAcquistoService.addFatturaAcquisto(payload);
    }
    this.filtraFatture();
    this.displayDialog = false;
  }

  // quando chiudo il dialog — pulisco
  onDialogHide() {
    this.formFattura.reset();
    this.editingFattura = null;
  }

  // per popolare e filtrare l'autocomplete fornitori
  filtraFornitori(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    let fornitori = [...this.fornitoriService.fornitori.getValue()];
    this.fornitoriFiltrati = fornitori.filter((f) =>
      f.ragioneSociale.toLowerCase().includes(query)
    );
  }

  filtraFatture() {
    let fatture = [...this.fattureAcquistoService.fattureAcquisto.getValue()];

    if (this.filtroFornitore) {
      fatture = fatture.filter((f) => f.fornitore?.id === this.filtroFornitore);
    }

    if (this.filtroNumeroFattura.trim()) {
      fatture = fatture.filter((f) =>
        f.numeroFattura
          .toLowerCase()
          .includes(this.filtroNumeroFattura.toLowerCase())
      );
    }

    // Filtri per data emissione
    if (this.filtroDataEmissioneInizio !== null) {
      fatture = fatture.filter(
        (f) => new Date(f.dataEmissione) >= this.filtroDataEmissioneInizio!
      );
    }

    if (this.filtroDataEmissioneFine !== null) {
      fatture = fatture.filter(
        (f) => new Date(f.dataEmissione) <= this.filtroDataEmissioneFine!
      );
    }

    // Filtri per data trasmissione
    if (this.filtroDataTrasmissioneInizio !== null) {
      fatture = fatture.filter(
        (f) =>
          new Date(f.dataTrasmissione) >= this.filtroDataTrasmissioneInizio!
      );
    }

    if (this.filtroDataTrasmissioneFine !== null) {
      fatture = fatture.filter(
        (f) => new Date(f.dataTrasmissione) <= this.filtroDataTrasmissioneFine!
      );
    }

    // Filtri per data inserimento
    if (this.filtroDataInserimentoInizio !== null) {
      fatture = fatture.filter(
        (f) => new Date(f.dataInserimento) >= this.filtroDataInserimentoInizio!
      );
    }

    if (this.filtroDataInserimentoFine !== null) {
      fatture = fatture.filter(
        (f) => new Date(f.dataInserimento) <= this.filtroDataInserimentoFine!
      );
    }

    fatture.sort(
      (a, b) =>
        new Date(b.dataEmissione).getTime() -
        new Date(a.dataEmissione).getTime()
    );

    this.fattureFiltrate.next(fatture);
    this.calcolaRipartizioneTemporale();
  }

  calcolaRipartizioneTemporale() {
    const fatture = this.fattureFiltrate.getValue();
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
      this.summary[key] = { imponibile: 0, imposta: 0, totale: 0 };
    }

    // 3) Assegna ogni fattura al bucket giusto
    for (const f of fatture) {
      const d = new Date(f.dataEmissione).getTime();
      for (const key of Object.keys(this.intervals) as Array<
        keyof typeof this.intervals
      >) {
        const { da, a } = this.intervals[key];
        if (d >= da.getTime() && d <= a.getTime()) {
          this.summary[key].imponibile += f.imponibile;
          this.summary[key].imposta += f.imposta;
          this.summary[key].totale += f.imponibile + f.imposta;
          break;
        }
      }
    }

    // 4) Totali complessivi
    this.totaleImponibile = Object.values(this.summary).reduce(
      (sum, b) => sum + b.imponibile,
      0
    );
    this.totaleImposta = Object.values(this.summary).reduce(
      (sum, b) => sum + b.imposta,
      0
    );
    this.totaleFatture = this.totaleImponibile + this.totaleImposta;
  }

  resetFiltri() {
    this.filtroFornitore = null;
    this.filtroDataEmissioneInizio = null;
    this.filtroDataEmissioneFine = null;
    this.filtroDataTrasmissioneInizio = null;
    this.filtroDataTrasmissioneFine = null;
    this.filtroDataInserimentoInizio = null;
    this.filtroDataInserimentoFine = null;
    this.filtroNumeroFattura = "";
    this.filtraFatture();
  }

  // Metodo per import CSV (placeholder per ora)
  importCSV() {
    // TODO: Implementare import CSV
    console.log("Import CSV - da implementare");
  }

  // Toggle per filtri avanzati
  toggleFiltriAvanzati() {
    this.showFiltriAvanzati = !this.showFiltriAvanzati;
  }

  ngOnDestroy(): void {
    this.fattureSubscription.unsubscribe();
    this.fornitoriSubscription.unsubscribe();
  }
}
