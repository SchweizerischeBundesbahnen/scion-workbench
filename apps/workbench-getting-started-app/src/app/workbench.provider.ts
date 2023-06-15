import {EnvironmentProviders, importProvidersFrom} from '@angular/core';
import {WorkbenchModule, WorkbenchModuleConfig} from '@scion/workbench';

/**
 * Provides a set of DI providers to set up @scion/workbench.
 */
export function provideWorkbench(config: WorkbenchModuleConfig): EnvironmentProviders {
  return importProvidersFrom(WorkbenchModule.forRoot(config));
}
