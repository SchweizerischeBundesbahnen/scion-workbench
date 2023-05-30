import {Pipe, PipeTransform} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {ɵMessageBox} from './ɵmessage-box';
import {map} from 'rxjs/operators';

/**
 * Collects CSS classes to be applied to the passed message box instance and returns them as
 * array in an Observable.
 */
@Pipe({name: 'wbMessageBoxCssClasses$', standalone: true})
export class MessageBoxCssClassesPipe implements PipeTransform {

  public transform(messageBox: ɵMessageBox): Observable<string[]> {
    return combineLatest([messageBox.severity$, messageBox.cssClass$])
      .pipe(
        map(([severity, cssClasses]) => new Array<string>()
          .concat(cssClasses)
          .concat(severity)
          .concat(`e2e-severity-${severity}`)),
      );
  }
}
