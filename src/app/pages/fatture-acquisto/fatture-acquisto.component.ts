import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { v4 as uuidv4 } from "uuid";
import { Fattura } from "../../models/fattura";
import { FattureService } from "../../services/fatture.service";
import { BehaviorSubject, Observable } from "rxjs";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { CalendarModule } from "primeng/calendar";
import { InputNumberModule } from "primeng/inputnumber";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { Fornitore } from "../../models/fornitore";
import { SelectModule } from "primeng/select";
import { FornitoriService } from "../../services/fornitori.service";

@Component({
  selector: "app-fatture-acquisto",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    InputNumberModule,
    DialogModule,
    SelectModule,
    TableModule,
  ],
  templateUrl: "./fatture-acquisto.component.html",
  styleUrls: ["./fatture-acquisto.component.scss"],
})
export class FattureAcquistoComponent implements OnInit {
  fatture$!: Observable<Fattura[]>;
  formFattura!: FormGroup;
  displayDialog = false;
  editingFattura: Fattura | null = null;

  constructor(
    private fb: FormBuilder,
    private fattureService: FattureService,
    public fornitoriService: FornitoriService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.fatture$ = this.fattureService.fatture;
  }

  initForm() {
    this.formFattura = this.fb.group({
      numeroFattura: ["", Validators.required],
      dataEmissione: [null, Validators.required],
      dataTrasmissione: [null],
      dataInserimento: [new Date().toISOString()],
      codiceFiscaleFornitore: ["", Validators.required],
      pIvaFornitore: ["", Validators.required],
      denominazioneFornitore: ["", Validators.required],
      imponibile: [0, [Validators.required, Validators.min(0)]],
      imposta: [0, [Validators.required, Validators.min(0)]],
    });
  }

  showDialog(fattura?: Fattura) {
    this.editingFattura = fattura ?? null;

    if (fattura) {
      this.formFattura.patchValue(fattura);
    } else {
      this.formFattura.reset({
        dataInserimento: new Date().toISOString(),
      });
    }

    this.displayDialog = true;
  }

  salvaFattura() {
    if (this.formFattura.invalid) {
      this.formFattura.markAllAsTouched();
      return;
    }

    const values = this.formFattura.value;

    const nuovaFattura = new Fattura({
      id: this.editingFattura?.id ?? uuidv4(),
      ...values,
      fornitore: {
        id: "", // da associare eventualmente
        ragioneSociale: values.denominazioneFornitore,
        partitaIva: values.pIvaFornitore,
        codiceFiscale: values.codiceFiscaleFornitore,
      },
    });

    if (this.editingFattura) {
      this.fattureService.updateFattura(nuovaFattura);
    } else {
      this.fattureService.addFattura(nuovaFattura);
    }

    this.displayDialog = false;
    this.formFattura.reset();
  }

  eliminaFattura(id: string) {
    this.fattureService.deleteFattura(id);
  }

  fattureImportPreview: {
    dati: Fattura;
    fornitoreSelezionato: Fornitore | null;
  }[] = [];

  onCsvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split("\n").filter((l) => l.trim() !== "");
      if (lines.length < 2) return;

      const headers = lines[0]
        .split(";")
        .map((h) => h.trim().replace(/"/g, "").replace(/'/g, ""));

      console.log("Headers:", headers);
      const preview: typeof this.fattureImportPreview = [];

      const parseImporto = (val: string): number => {
        if (!val || typeof val !== "string") return 0;
        return parseFloat(val.replace(/^0+/, "").replace(",", ".")) || 0;
      };

      const parseDate = (val: string): string => {
        if (!val || !val.includes("/")) {
          console.warn("Data non valida o mancante:", val);
          return new Date().toISOString(); // fallback: oggi
        }

        const parts = val.split("/");
        if (parts.length !== 3) {
          console.warn("Formato data non valido:", val);
          return new Date().toISOString();
        }

        const [gg, mm, aa] = parts;
        return new Date(`20${aa}-${mm}-${gg}`).toISOString();
      };

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(";");
        if (row.length < headers.length) continue;

        const riga: any = Object.fromEntries(
          headers.map((h, idx) => [
            h,
            (row[idx] || "").replace(/'/g, "").trim(),
          ])
        );
        if (i === 1) {
          console.log("Prima riga:", riga);
        }

        const dati: Fattura = {
          id: uuidv4(),
          numeroFattura: riga["Numero fattura / Documento"],
          dataEmissione: parseDate(riga["Data emissione"]),
          dataTrasmissione: parseDate(riga["Data trasmissione"]),
          dataInserimento: new Date().toISOString(),

          // campi fornitore vuoti all'inizio
          codiceFiscaleFornitore: "",
          pIvaFornitore: "",
          denominazioneFornitore: "",
          fornitore: {} as any,

          imponibile: parseImporto(riga["Imponibile/Importo (totale in euro)"]),
          imposta: parseImporto(riga["Imposta (totale in euro)"]),
        };
        preview.push({
          dati,
          fornitoreSelezionato: null,
        });
      }

      this.fattureImportPreview = preview;
    };

    reader.readAsText(file);
  }
  salvaImportFatture() {
    this.fattureImportPreview.forEach(({ dati, fornitoreSelezionato }) => {
      if (!fornitoreSelezionato) return;

      const fattura = new Fattura({
        ...dati,
        denominazioneFornitore: fornitoreSelezionato.ragioneSociale,
        fornitore: fornitoreSelezionato,
      });

      this.fattureService.addFattura(fattura);
    });

    this.fattureImportPreview = [];
  }
}
