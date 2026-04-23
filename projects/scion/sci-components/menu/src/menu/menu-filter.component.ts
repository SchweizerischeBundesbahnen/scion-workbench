import {ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SciTextPipe} from '@scion/sci-components/text';
import {SciIconComponent} from '@scion/sci-components/icon';

@Component({
  selector: 'sci-menu-filter',
  templateUrl: './menu-filter.component.html',
  styleUrl: './menu-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    SciTextPipe,
    SciIconComponent,
  ],
  host: {
    '[attr.tabindex]': '-1', // enable delegation of programmatic focus requests
    '(focus)': 'onFocus()',
  },
})
export class MenuFilterComponent {

  public readonly placeholder = input.required<string>();
  public readonly text = model<string>('');

  private readonly _inputField = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected onClear(): void {
    this.text.set('');
    this._inputField().nativeElement.focus();
  }

  protected onFocus(): void {
    this._inputField().nativeElement.focus();
  }
}
