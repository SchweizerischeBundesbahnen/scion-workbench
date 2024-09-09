import {Component, computed, effect, ElementRef, inject, Signal, signal, viewChild} from '@angular/core';
import {ProposalKeyFn, ProposalPopupFieldComponent, ProposalProviderFn} from '../proposal-popup-field/proposal-popup-field.component';
import persons from './persons.json';
import {ProposalFieldButtonDirective, ProposalFieldContentDirective} from '../proposal-popup-field/proposal-field.model';
import {PreferredSizeService} from '@scion/microfrontend-platform';
import {WorkbenchPopup} from '@scion/workbench-client';
import {InjectElementRefDirective} from '../proposal-popup-field/inject-element-ref.directive';
import {SciMaterialIconDirective} from '@scion/components.internal/material-icon';

@Component({
  selector: 'app-proposal-popup-page',
  templateUrl: './proposal-popup-page.component.html',
  styleUrls: ['./proposal-popup-page.component.scss'],
  standalone: true,
  imports: [
    ProposalPopupFieldComponent,
    ProposalFieldContentDirective,
    InjectElementRefDirective,
    SciMaterialIconDirective,
    ProposalFieldButtonDirective,
  ],
})
export default class ProposalPopupPageComponent {

  protected persons: Person[] = persons;
  protected proposalField = viewChild.required(ProposalPopupFieldComponent, {read: ElementRef<HTMLElement>});
  protected selection = signal<string[]>([]);
  protected initialSelection: string[] = [];

  constructor(private _workbenchPopup: WorkbenchPopup) {
    if (this._workbenchPopup.params.has('selection')) {
      this.selection.set(this._workbenchPopup.params.get('selection')!.split(',').filter(Boolean));
      this.initialSelection = this.selection();
    }
    const preferredSizeService = inject(PreferredSizeService);
    effect(() => preferredSizeService.fromDimension(this.proposalField().nativeElement));
    effect(() => this._workbenchPopup.setResult(this.selection()));
  }

  protected onClear(): void {
    this._workbenchPopup.close([]);
  }

  protected onAssignMe(): void {
    this._workbenchPopup.close([5]);
  }

  protected proposalProviderFn: ProposalProviderFn<Person> = (filter: Signal<string>, selection: Signal<string[]>): Signal<Person[]> => {
    // Fetching data synchronously
    return computed(() => this.persons
      .filter(person => `${person.firstname} ${person.lastname}`.toLocaleLowerCase().includes(filter().toLocaleLowerCase()))
      .sort((a, b) => `${a.lastname} ${a.firstname}`.localeCompare(`${b.lastname} ${b.firstname}`)));

    // Fetching data asynchronously via Observable
    // const filter$ = toObservable(filter);
    // const proposals$ = filter$.pipe(map(filter => this.persons
    //   .filter(person => `${person.firstname} ${person.lastname}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()))
    //   .sort((a, b) => `${a.lastname} ${a.firstname}`.localeCompare(`${b.lastname} ${b.firstname}`))));
    // return toSignal(proposals$, {initialValue: []});
  };

  protected proposalKeyFn: ProposalKeyFn<Person> = (person: Person): string => {
    return person.id;
  };
}

export interface Person {
  id: string;
  firstname: string;
  lastname: string;
}
