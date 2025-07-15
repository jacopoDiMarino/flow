import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FatturaAcquisto } from "../models/fattura-acquisto";

@Injectable({
  providedIn: "root",
})
export class FattureAcquistoService {
  url = "http://localhost:3000/fattureAcquisto/";
  fattureAcquisto: BehaviorSubject<FatturaAcquisto[]> = new BehaviorSubject<
    FatturaAcquisto[]
  >([]);

  constructor() {}

  getFattureAcquisto() {}
}
