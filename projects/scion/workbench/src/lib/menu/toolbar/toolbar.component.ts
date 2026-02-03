import {Component, input} from '@angular/core';
import {SciToolGroupComponent} from './tool-item-group/tool-item-group.component';

@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  imports: [
    SciToolGroupComponent,
  ],
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();
}
