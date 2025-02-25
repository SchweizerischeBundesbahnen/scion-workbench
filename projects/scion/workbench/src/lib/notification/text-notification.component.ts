import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Notification} from './notification';

/**
 * Component for displaying a plain text notification.
 */
@Component({
  selector: 'wb-text-notification',
  template: `{{text ?? ''}}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextNotificationComponent {

  public text: string | undefined = inject(Notification).input as string | undefined;
}
