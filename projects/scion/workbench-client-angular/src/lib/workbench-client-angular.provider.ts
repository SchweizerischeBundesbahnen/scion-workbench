import {Provider} from '@angular/core';
import {provideWorkbenchClientAngularMenuAdapter} from './menu/workbench-client-angular-menu-adapter';

export function provideWorkbenchClientAngular(): Provider[] {
  return [
    provideWorkbenchClientAngularMenuAdapter(),
  ];
}
