import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench-client';

@Component({
  selector: 'app-projects',
  template: 'Projects Part',
})
export default class ProjectsComponent {

  constructor() {
    inject(WorkbenchPart).signalReady();
  }
}
