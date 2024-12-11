import {Component, inject} from '@angular/core';
import {WorkbenchPart} from '@scion/workbench';

@Component({
  selector: 'app-part-page',
  standalone: true,
  templateUrl: './part-page.component.html',
  styleUrl: './part-page.component.scss',
})
export default class PartPageComponent {

  constructor() {
    inject(WorkbenchPart).cssClass = 'marc';
  }
}
