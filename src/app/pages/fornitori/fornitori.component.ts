import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Fornitore } from '../../models/fornitore';
import { FornitoriService } from '../../services/fornitori.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-fornitori',
  templateUrl: './fornitori.component.html',
  styleUrls: ['./fornitori.component.scss'],
  standalone: true,
  imports: [FormsModule, AsyncPipe, NgIf],
})
export class FornitoriComponent implements OnInit, OnDestroy {
  fornitori: BehaviorSubject<Fornitore[]> = new BehaviorSubject<Fornitore[]>(
    [],
  );
  fornitoriSubscription: Subscription;
  ragioneSociale: string = '';

  constructor(public fornitoriService: FornitoriService) {
    // this.fornitoriService.getFornitori();
    this.fornitoriSubscription = this.fornitoriService.fornitori.subscribe(
      (res) => {
        console.log(res, 'res');
        this.fornitori.next(res);
        console.log(this.fornitori.getValue());
      },
    );
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.fornitoriSubscription.unsubscribe();
  }
}
