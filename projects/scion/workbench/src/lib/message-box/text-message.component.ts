import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageBox } from './message-box';

/**
 * Component for displaying a plain text message.
 *
 * This component expects a {Map} data structure as input object,
 * with the text message contained under the '$implicit' key.
 */
@Component({
  selector: 'wb-text-message',
  template: '{{text}}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextMessageComponent {

  public text: string;

  constructor(messageBox: MessageBox<Map<string | '$implicit', any>>) {
    this.text = messageBox.input.get('$implicit');
  }
}
