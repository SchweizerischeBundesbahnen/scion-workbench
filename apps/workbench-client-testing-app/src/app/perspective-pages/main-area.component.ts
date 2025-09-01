import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-main-area',
  template: 'MAIN AREA',
})
export default class MainAreaComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
