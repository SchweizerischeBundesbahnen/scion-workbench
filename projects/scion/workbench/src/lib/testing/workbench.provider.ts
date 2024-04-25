import {WorkbenchConfig} from '../workbench-config';
import {ENVIRONMENT_INITIALIZER, EnvironmentProviders, inject, Injectable, makeEnvironmentProviders} from '@angular/core';
import {provideWorkbench} from '../workbench.provider';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {ActivationInstantProvider} from '../activation-instant.provider';
import {MAIN_AREA_INITIAL_PART_ID} from '../layout/ɵworkbench-layout';
import {ComponentFixtureAutoDetect} from '@angular/core/testing';
import {Router} from '@angular/router';

/**
 * Returns the set of dependency-injection providers to enable and configure the SCION Workbench in tests.
 *
 * Does the following:
 * - provides the workbench with given config
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
export function provideWorkbenchForTest(config?: WorkbenchConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideWorkbench(config),
    provideNoopAnimations(),
    {provide: ActivationInstantProvider, useClass: SequenceInstantProvider},
    {provide: MAIN_AREA_INITIAL_PART_ID, useValue: 'main'},
    {provide: ComponentFixtureAutoDetect, useValue: true},
    {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => inject(Router).initialNavigation()},
    {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => localStorage.clear()},
    {provide: ENVIRONMENT_INITIALIZER, multi: true, useValue: () => window.name = ''},
  ]);
}

@Injectable(/* DO NOT PROVIDE via 'providedIn' metadata as registered only if using `WorkbenchTestingModule`. */)
class SequenceInstantProvider implements ActivationInstantProvider {

  private _sequence = 0;

  public now(): number {
    return this._sequence++;
  }
}
