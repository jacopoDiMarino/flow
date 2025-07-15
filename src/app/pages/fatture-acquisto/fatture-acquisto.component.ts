import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-fatture-acquisto",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./fatture-acquisto.component.html",
  styleUrls: ["./fatture-acquisto.component.scss"],
})
export class FattureAcquistoComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
