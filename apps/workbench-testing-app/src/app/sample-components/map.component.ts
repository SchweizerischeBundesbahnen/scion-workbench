import {Component, inject} from '@angular/core';
import {WorkbenchView} from '@scion/workbench';
import {UUID} from '@scion/toolkit/uuid';

@Component({
  selector: 'app-map',
  template: '',
  styles: `
    :host {
      background-image: url('/map.png');
      background-size: auto;
      background-repeat: repeat;
      background-position: center;
    }`,
})
export default class MapComponent {

  constructor() {
    inject(WorkbenchView).title = `Konflikte Szenario ${UUID.randomUUID().substring(0, 5).toLocaleUpperCase()}`;
  }
}
