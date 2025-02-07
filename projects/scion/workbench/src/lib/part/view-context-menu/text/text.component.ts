import {Component, input} from '@angular/core';

@Component({
  selector: 'wb-text',
  template: '{{text()}}',
  styleUrl: './text.component.scss',
})
export class TextComponent {

  protected readonly text = input.required<string>();
}
