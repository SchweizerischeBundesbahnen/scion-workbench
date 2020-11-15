import { Injectable, ModuleWithProviders, NgModule } from '@angular/core';
import { ViewActivationInstantProvider } from '../view/view-activation-instant-provider.service';
import { WorkbenchModule } from '../workbench.module';
import { WorkbenchConfig } from '../workbench.config';
import { FromDimension } from '@scion/toolkit/observable';
import { PARTS_LAYOUT_ROOT_PART_IDENTITY } from '../layout/parts-layout.factory';

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
    WorkbenchTestingModule.disableNativeResizeObserver();
    return {
      ngModule: WorkbenchTestingModule,
      providers: [
        WorkbenchModule.forRoot(config).providers,
        {provide: ViewActivationInstantProvider, useClass: ViewActivationTestingInstantProvider},
        {provide: PARTS_LAYOUT_ROOT_PART_IDENTITY, useValue: 'main'},
      ],
    };
  }

  public static forChild(): ModuleWithProviders<WorkbenchTestingModule> {
    return WorkbenchModule.forChild();
  }

  /**
   * Disable native `ResizeObserver` in tests because it sometimes throws 'loop limit exceeded' error which can safely be ignored.
   *
   * Comment from the specification authors:
   * ﻿This error means that `ResizeObserver` was not able to deliver all observations within a single animation frame. It is benign and the site will not break.
   * See https://stackoverflow.com/a/50387233
   */
  private static disableNativeResizeObserver(): void {
    FromDimension.defaults.useNativeResizeObserver = false;
  }
}
