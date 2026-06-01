import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {TextPipe} from '../../../text/text.pipe';

@Component({
  selector: 'wb-text',
  template: '{{(text() | wbText)()}}',
  styleUrl: './text.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TextPipe,
  ],
})
export class TextComponent {

  public readonly text = input.required<string>();
}
