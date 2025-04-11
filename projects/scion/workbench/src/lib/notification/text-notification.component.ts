import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {Notification} from './notification';
import {TextPipe} from '../text/text.pipe';
import {Translatable} from '../text/workbench-text-provider.model';

/**
 * Component for displaying a plain text notification.
 */
@Component({
  selector: 'wb-text-notification',
  template: `{{(text | wbText)()}}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TextPipe,
  ],
})
export class TextNotificationComponent {

  public text = inject(Notification).input as Translatable | undefined;
}
