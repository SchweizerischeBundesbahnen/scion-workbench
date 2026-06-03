import {Component, inject} from '@angular/core';
import {WorkbenchDialogService, WorkbenchView} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';
import ZwlMagnifierComponent from './zwl-magnifier.component';
import {contributeMenu} from '@scion/components/menu';

@Component({
  selector: 'app-zwl',
  template: '',
  styles: `
    :host {
      background-image: url('/zwl.jpg');
      background-size: cover;
    }
  `,
})
export default class ZwlComponent {

  private readonly view = inject(WorkbenchView);
  private readonly workbenchDialogService = inject(WorkbenchDialogService);

  constructor() {
    this.view.title = `Szenario ${UUID.randomUUID().substring(0, 5).toLocaleUpperCase()}`;

    // Contribute magnifier to part toolbar.
    contributeMenu('toolbar:workbench.part.toolbar', toolbar => {
        return toolbar
          .addToolbarButton({icon: 'zoom_in', tooltip: 'Lupe', onSelect: () => this.workbenchDialogService.open(ZwlMagnifierComponent, {inputs: {title: `EV, VERN, MA, CHAR (08:00 - 09:00)`}, modality: 'none'})});
      },
    )
  }
}
