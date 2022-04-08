import {Injectable, ModuleWithProviders, NgModule} from '@angular/core';
import {ViewActivationInstantProvider} from '../view/view-activation-instant-provider.service';
import {WorkbenchModule} from '../workbench.module';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {PARTS_LAYOUT_ROOT_PART_IDENTITY} from '../layout/parts-layout.factory';

@Injectable()
export class ViewActivationTestingInstantProvider implements ViewActivationInstantProvider {

  private _counter = 0;

  public get instant(): number {
    return this._counter++;
  }
}

/**
 * Sets up the workbench to be used for testing.
 */
@NgModule({
  exports: [WorkbenchModule],
})
export class WorkbenchTestingModule {

  public static forRoot(workbenchModuleConfig: WorkbenchModuleConfig = {}): ModuleWithProviders<WorkbenchTestingModule> {
    return {
      ngModule: WorkbenchTestingModule,
      providers: [
        WorkbenchModule.forRoot(workbenchModuleConfig).providers ?? [],
        {provide: ViewActivationInstantProvider, useClass: ViewActivationTestingInstantProvider},
        {provide: PARTS_LAYOUT_ROOT_PART_IDENTITY, useValue: 'main'},
      ],
    };
  }

  public static forChild(): ModuleWithProviders<WorkbenchTestingModule> {
    return WorkbenchModule.forChild();
  }
}
