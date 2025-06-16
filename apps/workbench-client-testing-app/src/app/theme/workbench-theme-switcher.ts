import {DOCUMENT, EnvironmentProviders, inject, makeEnvironmentProviders} from '@angular/core';
import {WorkbenchThemeMonitor} from '@scion/workbench-client';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {provideWorkbenchClientInitializer} from '../workbench-client/workbench-client-initializer';

/**
 * Switches the theme when changed in the workbench.
 */
function installThemeSwitcher(): void {
  const workbenchThemeMonitor = inject(WorkbenchThemeMonitor);
  const documentRoot = inject(DOCUMENT).documentElement;

  workbenchThemeMonitor.theme$
    .pipe(takeUntilDestroyed())
    .subscribe(theme => {
      if (theme) {
        documentRoot.setAttribute('sci-theme', theme.name);
      }
      else {
        documentRoot.removeAttribute('sci-theme');
      }
    });
}

/**
 * Registers a set of DI providers to set up workbench theme.
 */
export function provideWorkbenchTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbenchClientInitializer(() => installThemeSwitcher()),
  ]);
}
