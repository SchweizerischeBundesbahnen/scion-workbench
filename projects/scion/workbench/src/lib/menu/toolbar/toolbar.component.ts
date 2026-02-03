import {Component, input} from '@angular/core';
import {SciToolGroupComponent} from './tool-group/tool-group.component';

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
