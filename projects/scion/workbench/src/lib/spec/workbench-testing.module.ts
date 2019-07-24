import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { ViewActivationInstantProvider } from '../view-activation-instant-provider.service';
import { WorkbenchModule } from '../workbench.module';
import { WorkbenchConfig } from '../workbench.config';

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

  public static forRoot(config: WorkbenchConfig = {}): ModuleWithProviders<WorkbenchTestingModule> {
    return {
      ngModule: WorkbenchTestingModule,
      providers: [
        WorkbenchModule.forRoot(config).providers,
        {provide: ViewActivationInstantProvider, useClass: ViewActivationTestingInstantProvider},
      ],
    };
  }

  public static forChild(): ModuleWithProviders<WorkbenchTestingModule> {
    return WorkbenchModule.forChild();
  }
}
