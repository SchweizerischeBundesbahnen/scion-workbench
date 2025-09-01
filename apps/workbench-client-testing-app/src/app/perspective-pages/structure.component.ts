import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-structure',
  template: 'Structure Part',
})
export default class StructureComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
