import {SciMenuAdapter} from '@scion/sci-components/menu';
import {WorkbenchClientMenuAdapter} from './workbench-client-menu-adapter';
import {Provider} from '@angular/core';
import {Beans} from '@scion/toolkit/bean-manager';
import {WorkbenchMenuService, ɵWorkbenchMenuService} from '@scion/workbench-client';

export function provideWorkbenchClientMenuAdapter(): Provider[] {
  return [
    {provide: SciMenuAdapter, useClass: WorkbenchClientMenuAdapter},
    {provide: WorkbenchMenuService, useFactory: () => Beans.get(WorkbenchMenuService)},
    {provide: ɵWorkbenchMenuService, useFactory: () => Beans.get(ɵWorkbenchMenuService)},
  ];
}
