import {ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'sci-menu-item-filter',
  templateUrl: './menu-item-filter.component.html',
  styleUrl: './menu-item-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class MenuItemFilterComponent {

  public readonly placeholder = input.required<string>();
  public readonly text = model<string>('');

  private readonly inputField = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected onClear(): void {
    this.text.set('');
    this.inputField().nativeElement.focus();
  }
}
  
