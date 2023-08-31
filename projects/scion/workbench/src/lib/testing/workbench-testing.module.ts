import {ENVIRONMENT_INITIALIZER, importProvidersFrom, inject, Injectable, ModuleWithProviders, NgModule} from '@angular/core';
import {WorkbenchModule} from '../workbench.module';
import {WorkbenchModuleConfig} from '../workbench-module-config';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {MAIN_AREA_INITIAL_PART_ID} from '../layout/ɵworkbench-layout';
import {Router} from '@angular/router';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';

/**
 * Sets up the SCION Workbench to be used for testing.
 *
 * It does the following:
 * - provides the workbench applying given config
 * - configures the workbench to name the initial part 'main'
 * - installs a sequence for activation instants
 * - configures the testbed to auto-detect changes
 * - disables animations
 * - performs the initial navigation
 *
 * ### Usage
 *
 * ```
 * beforeEach(() => {
 *   TestBed.configureTestingModule({
 *      imports: [
 *        WorkbenchTestingModule.forTest(),
 *        RouterTestingModule.withRoutes([
 *          {path: 'test-view', component: TestComponent},
 *        ]),
 *      ],
 *    });
 * });
 * ```
 */
@NgModule({exports: [WorkbenchModule]})
export class WorkbenchTestingModule {

  /**
   * Sets up the SCION Workbench to be used for testing.
   */
  public static forTest(config?: WorkbenchModuleConfig): ModuleWithProviders<WorkbenchTestingModule> {
    return {
      ngModule: WorkbenchTestingModule,
      providers: [
        importProvidersFrom(WorkbenchModule.forRoot(config)),
        provideNoopAnimations(),
        {provide: ActivationInstantProvider, useClass: SequenceInstantProvider},
        {provide: MAIN_AREA_INITIAL_PART_ID, useValue: 'main'},
        {provide: ComponentFixtureAutoDetect, useValue: true},
        {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => inject(Router).initialNavigation()},
        {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => localStorage.clear()},
        {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => window.name = ''},
      ],
    };
  }
}

@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered only if using `WorkbenchTestingModule`. */)
class SequenceInstantProvider implements ActivationInstantProvider {

  private _sequence = 0;

  public now(): number {
    return this._sequence++;
  }
}
