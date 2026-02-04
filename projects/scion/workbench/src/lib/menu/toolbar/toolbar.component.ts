import {ChangeDetectionStrategy, Component, input, signal} from '@angular/core';
import {SciToolGroupComponent} from './tool-item-group/tool-item-group.component';

@Component({
  selector: 'sci-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SciToolGroupComponent,
  ],
  host: {
    '[class.empty]': 'empty()',
  },
})
export class SciToolbarComponent {

  public readonly name = input.required<string>();

  protected readonly empty = signal(true);

  protected onCountChange(count: number): void {
    this.empty.set(count === 0);
  }
}
