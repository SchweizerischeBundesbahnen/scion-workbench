import {SciMenuAdapter, SciMenuContextProvider} from '@scion/sci-components/menu';
import {MicrofrontendMenuContextProvider} from './microfrontend-menu-context-provider';
import {WorkbenchClientMenuAdapter} from './workbench-client-menu-adapter';
import {Provider} from '@angular/core';

export function provideWorkbenchClientMenuAdapter(): Provider[] {
  return [
    {provide: SciMenuAdapter, useClass: WorkbenchClientMenuAdapter},
    {provide: SciMenuContextProvider, useClass: MicrofrontendMenuContextProvider},
  ];
}
