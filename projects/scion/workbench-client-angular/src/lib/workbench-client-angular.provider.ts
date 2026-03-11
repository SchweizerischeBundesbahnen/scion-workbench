import {Provider} from '@angular/core';
import {provideWorkbenchClientMenuAdapter} from './menu/workbench-client-menu-adapter.provider';

export function provideWorkbenchClientAngular(): Provider[] {
  return [
    provideWorkbenchClientMenuAdapter(),
  ];
}
