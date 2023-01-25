import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Notification} from './notification';
import {Observable} from 'rxjs';
import {Observables} from '@scion/toolkit/util';

/**
 * Component for displaying a plain text notification.
 */
@Component({
  selector: 'wb-text-notification',
  template: `{{ (text$ | async) ?? ''}}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextNotificationComponent {

  public text$:  Observable<string | undefined>;

  constructor(notification: Notification) {
    this.text$ = Observables.coerce(notification.input);
  }
}
