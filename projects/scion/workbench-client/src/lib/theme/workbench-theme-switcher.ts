import {Beans, PreDestroy} from '@scion/toolkit/bean-manager';
import {Subscription} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {WorkbenchThemeMonitor} from './workbench-theme-monitor';

/**
 * Switches the theme when changed in the workbench.
 *
 * @internal
 */
export class WorkbenchThemeSwitcher implements PreDestroy {

  private readonly _subscription: Subscription;

  constructor() {
    const workbenchThemeMonitor = Beans.get(WorkbenchThemeMonitor);
    const documentRoot = document.documentElement;

    this._subscription = workbenchThemeMonitor.theme$
      .pipe(finalize(() => documentRoot.removeAttribute('sci-theme')))
      .subscribe(theme => {
        if (theme) {
          documentRoot.setAttribute('sci-theme', theme.name);
        }
        else {
          documentRoot.removeAttribute('sci-theme');
        }
      });
  }

  public preDestroy(): void {
    this._subscription.unsubscribe();
  }
}
