import {Component, effect, inject, input} from '@angular/core';
import {WorkbenchDialog} from '@scion/workbench';

@Component({
  selector: 'app-zwl-magnifier',
  template: '',
  styles: `
    :host {
      background-image: url('/zwl.jpg');
      background-position: center;
      background-size: 350% 350%;
      width: 500px;
      height: 500px;
    }
  `,
})
export default class ZwlMagnifierComponent {

  public readonly title = input.required<string>();

  constructor() {
    const dialog = inject(WorkbenchDialog);
    dialog.padding = false;

    effect(() => {
      dialog.title = this.title();
    });
  }
}
