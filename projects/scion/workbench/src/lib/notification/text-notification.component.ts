import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Notification} from './notification';

/**
 * Component for displaying a plain text notification.
 */
@Component({
  selector: 'wb-text-notification',
  template: `{{text ?? ''}}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class TextNotificationComponent {

  public text: string | undefined;

  constructor(notification: Notification) {
    this.text = notification.input as string | undefined;
  }
}
