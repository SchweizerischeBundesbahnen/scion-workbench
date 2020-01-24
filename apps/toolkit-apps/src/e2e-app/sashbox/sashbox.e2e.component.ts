import { Component } from '@angular/core';

@Component({
  selector: 'e2e-sashbox', // tslint:disable-line:component-selector
  templateUrl: './sashbox.e2e.component.html',
  styleUrls: ['./sashbox.e2e.component.scss'],
})
export class SashboxE2eComponent {

  public direction: 'row' | 'column' = 'row';

  public sashes: Sash[] = [
    {visible: true, size: '100px', minSize: 75},
    {visible: true, size: '1', minSize: 50},
    {visible: true, size: '100px', minSize: 75},
  ];
}

export interface Sash {
  visible: boolean;
  size?: string;
  minSize?: number;
}
