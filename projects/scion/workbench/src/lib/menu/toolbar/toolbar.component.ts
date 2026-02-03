import {Component, input} from '@angular/core';
import {SciToolGroupComponent} from './tool-group/tool-group.component';
import {ActiveMenuTracker} from './tool-group/active-menu-tracker';

@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  imports: [
    SciToolGroupComponent,
  ],
  providers: [
    ActiveMenuTracker,
  ],
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();
}
