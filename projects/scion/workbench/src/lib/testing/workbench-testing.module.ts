import {ModuleWithProviders, NgModule} from '@angular/core';
import {WorkbenchConfig} from '../workbench-config';
import {provideWorkbenchForTest} from './workbench.provider';

/**
 * Sets up the SCION Workbench to be used for testing.
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
 *
 * @deprecated since version 17.0.0-beta.8; Register SCION Workbench providers using `provideWorkbench` function instead; API will be removed in a future release; API will be removed in a future release.
 */
@NgModule()
export class WorkbenchTestingModule {

  /**
   * Sets up the SCION Workbench to be used for testing.
   */
  public static forTest(config?: WorkbenchConfig): ModuleWithProviders<WorkbenchTestingModule> {
    return {
      ngModule: WorkbenchTestingModule,
      providers: [provideWorkbenchForTest(config)],
    };
  }
}
