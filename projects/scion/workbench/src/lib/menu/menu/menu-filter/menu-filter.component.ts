import {Component, ElementRef, input, model, viewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'wb-menu-filter',
  templateUrl: './menu-filter.component.html',
  styleUrl: './menu-filter.component.scss',
  imports: [
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class MenuFilterComponent {

  public readonly placeholder = input.required<string>();
  public readonly text = model<string>('');

  private readonly inputField = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected onClear(): void {
    this.text.set('');
    this.inputField().nativeElement.focus();
  }
}
  
