import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-terminal',
  template: 'Terminal Part',
})
export default class TerminalComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
