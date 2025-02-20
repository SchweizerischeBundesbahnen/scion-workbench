import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ɵNotification} from './ɵnotification';

/**
 * Collects CSS classes to be applied to the passed notification instance and returns them as
 * array in an Observable.
 */
@Pipe({name: 'wbNotificationCssClasses$'})
export class NotificationCssClassesPipe implements PipeTransform {

  public transform(notification: ɵNotification): Observable<string[]> {
    return combineLatest([notification.severity$, notification.cssClass$])
      .pipe(map(([severity, cssClasses]) => new Array<string>()
        .concat(cssClasses)
        .concat(severity)
        .concat(`e2e-severity-${severity}`),
      ));
  }
}
