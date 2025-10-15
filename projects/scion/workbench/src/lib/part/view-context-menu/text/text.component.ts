import {Component, input} from '@angular/core';
import {TextPipe} from '../../../text/text.pipe';

@Component({
  selector: 'wb-text',
  template: '{{(text() | wbText)()}}',
  styleUrl: './text.component.scss',
  imports: [
    TextPipe,
  ],
})
export class TextComponent {

  public readonly text = input.required<string>();
}
