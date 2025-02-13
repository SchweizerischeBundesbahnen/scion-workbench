/*
 * Copyright (c) 2018-2024 Swiss Federal Railways
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';
import {provideRouter} from '@angular/router';
import {firstValueFrom, Subject} from 'rxjs';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {styleFixture, waitForInitialWorkbenchLayout, waitUntilStable} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchCapabilities, WorkbenchDialogCapability, WorkbenchDialogService} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

describe('Microfrontend Host Dialog', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should allow opening multiple host dialogs in parallel', async () => {
    const canActivateDialog1 = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Dialog,
                    qualifier: {component: 'dialog-1'},
                    properties: {
                      path: 'path/to/dialog/1',
                    },
                  } satisfies WorkbenchDialogCapability,
                  {
                    type: WorkbenchCapabilities.Dialog,
                    qualifier: {component: 'dialog-2'},
                    properties: {
                      path: 'path/to/dialog/2',
                    },
                  } satisfies WorkbenchDialogCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/dialog/1', canActivate: [() => firstValueFrom(canActivateDialog1)], component: SpecDialog1Component},
          {path: 'path/to/dialog/2', component: SpecDialog2Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Start navigation in host dialog 1.
    void TestBed.inject(WorkbenchDialogService).open({component: 'dialog-1'});
    await waitUntilStable();

    // Start paralell navigation in host dialog 2.
    void TestBed.inject(WorkbenchDialogService).open({component: 'dialog-2'});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecDialog1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecDialog2Component);

    // Unblock first navigation.
    canActivateDialog1.next(true);
    await waitUntilStable();

    // Both dialogs should be visible.
    expect(fixture.debugElement.parent).toShow(SpecDialog1Component);
    expect(fixture.debugElement.parent).toShow(SpecDialog2Component);
  });

  it('should allow opening a host dialog and a view in parallel', async () => {
    const canActivateDialog = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Dialog,
                    qualifier: {component: 'dialog'},
                    properties: {
                      path: 'path/to/dialog',
                    },
                  } satisfies WorkbenchDialogCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/dialog', canActivate: [() => firstValueFrom(canActivateDialog)], component: SpecDialog1Component},
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Start navigation in a host dialog.
    void TestBed.inject(WorkbenchDialogService).open({component: 'dialog'});
    await waitUntilStable();

    // Start parallel navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecDialog1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);

    // Unblock first navigation.
    canActivateDialog.next(true);
    await waitUntilStable();

    // Dialog and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecDialog1Component);
    expect(fixture.debugElement.parent).toShow(SpecViewComponent);
  });

  it('should allow opening a view and a host dialog in parallel', async () => {
    const canActivateView = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Dialog,
                    qualifier: {component: 'dialog'},
                    properties: {
                      path: 'path/to/dialog',
                    },
                  } satisfies WorkbenchDialogCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/view', canActivate: [() => firstValueFrom(canActivateView)], component: SpecViewComponent},
          {path: 'path/to/dialog', component: SpecDialog1Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitForInitialWorkbenchLayout();

    // Start navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // Start parallel navigation in a host dialog.
    void TestBed.inject(WorkbenchDialogService).open({component: 'dialog'});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecDialog1Component);

    // Unblock first navigation.
    canActivateView.next(true);
    await waitUntilStable();

    // Dialog and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecViewComponent);
    expect(fixture.debugElement.parent).toShow(SpecDialog1Component);
  });
});

@Component({
  selector: 'spec-dialog-1',
  template: '',
  standalone: true,
})
class SpecDialog1Component {
}

@Component({
  selector: 'spec-dialog-2',
  template: '',
  standalone: true,
})
class SpecDialog2Component {
}

@Component({
  selector: 'spec-view',
  template: '',
  standalone: true,
})
class SpecViewComponent {
}
