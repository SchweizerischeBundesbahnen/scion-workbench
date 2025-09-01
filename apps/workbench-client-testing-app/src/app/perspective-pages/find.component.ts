import {Component, inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench-client';

@Component({
  selector: 'app-find',
  template: 'Find Part',
})
export default class FindComponent {

  constructor() {
    inject(WorkbenchView).signalReady();
  }
}
