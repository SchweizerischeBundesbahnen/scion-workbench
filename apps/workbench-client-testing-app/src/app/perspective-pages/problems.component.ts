import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-problems',
  template: 'Problems Part',
})
export default class ProblemsComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
