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
  constructor() {}

  ngOnInit(): void {}
}
