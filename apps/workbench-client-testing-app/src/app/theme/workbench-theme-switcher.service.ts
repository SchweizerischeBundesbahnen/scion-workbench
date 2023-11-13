import {EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {WorkbenchTheme, WorkbenchThemeMonitor} from '@scion/workbench-client';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {WORKBENCH_POST_CONNECT} from '../workbench-client/workbench-client.provider';

/**
 * Switches the theme when changed in the workbench.
 */
@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as associated with the {@link WORKBENCH_POST_CONNECT} DI token. */)
class WorkbenchThemeSwitcher {

  constructor(workbenchThemeMonitor: WorkbenchThemeMonitor) {
    const documentRoot = inject<Document>(DOCUMENT).documentElement;

    workbenchThemeMonitor.theme$
      .pipe(takeUntilDestroyed())
      .subscribe((theme: WorkbenchTheme | null) => {
        if (theme) {
          documentRoot.setAttribute('sci-theme', theme.name);
        }
        else {
          documentRoot.removeAttribute('sci-theme');
        }
      });
  }
}

/**
 * Registers a set of DI providers to set up workbench theme.
 */
export function provideWorkbenchTheme(): EnvironmentProviders {
  return makeEnvironmentProviders([
    {provide: WORKBENCH_POST_CONNECT, useClass: WorkbenchThemeSwitcher, multi: true},
  ]);
}
