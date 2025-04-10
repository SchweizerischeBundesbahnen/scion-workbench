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
import {styleFixture, waitUntilWorkbenchStarted, waitUntilStable} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchCapabilities, WorkbenchMessageBoxCapability, WorkbenchMessageBoxService} from '@scion/workbench-client';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

describe('Microfrontend Host Message Box', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should allow opening multiple host message boxes in parallel', async () => {
    const canActivateMessageBox1 = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.MessageBox,
                    qualifier: {component: 'message-box-1'},
                    properties: {
                      path: 'path/to/messagebox/1',
                    },
                  } satisfies WorkbenchMessageBoxCapability,
                  {
                    type: WorkbenchCapabilities.MessageBox,
                    qualifier: {component: 'message-box-2'},
                    properties: {
                      path: 'path/to/messagebox/2',
                    },
                  } satisfies WorkbenchMessageBoxCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/messagebox/1', canActivate: [() => firstValueFrom(canActivateMessageBox1)], component: SpecMessageBox1Component},
          {path: 'path/to/messagebox/2', component: SpecMessageBox2Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in host message box 1.
    void TestBed.inject(WorkbenchMessageBoxService).open({component: 'message-box-1'});
    await waitUntilStable();

    // Start parallel navigation in host message box 2.
    void TestBed.inject(WorkbenchMessageBoxService).open({component: 'message-box-2'});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecMessageBox1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecMessageBox2Component);

    // Unblock first navigation.
    canActivateMessageBox1.next(true);
    await waitUntilStable();

    // Both message boxes should be visible.
    expect(fixture.debugElement.parent).toShow(SpecMessageBox1Component);
    expect(fixture.debugElement.parent).toShow(SpecMessageBox2Component);
  });

  it('should allow opening a host message box and a view in parallel', async () => {
    const canActivateMessageBox = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.MessageBox,
                    qualifier: {component: 'message-box'},
                    properties: {
                      path: 'path/to/message-box',
                    },
                  } satisfies WorkbenchMessageBoxCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/message-box', canActivate: [() => firstValueFrom(canActivateMessageBox)], component: SpecMessageBox1Component},
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in a host message-box.
    void TestBed.inject(WorkbenchMessageBoxService).open({component: 'message-box'});
    await waitUntilStable();

    // Start parallel navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecMessageBox1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);

    // Unblock first navigation.
    canActivateMessageBox.next(true);
    await waitUntilStable();

    // Message box and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecMessageBox1Component);
    expect(fixture.debugElement.parent).toShow(SpecViewComponent);
  });

  it('should allow opening a view and a host message box in parallel', async () => {
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
                    type: WorkbenchCapabilities.MessageBox,
                    qualifier: {component: 'message-box'},
                    properties: {
                      path: 'path/to/message-box',
                    },
                  } satisfies WorkbenchMessageBoxCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/view', canActivate: [() => firstValueFrom(canActivateView)], component: SpecViewComponent},
          {path: 'path/to/message-box', component: SpecMessageBox1Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // Start parallel navigation in a host message-box.
    void TestBed.inject(WorkbenchMessageBoxService).open({component: 'message-box'});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecMessageBox1Component);

    // Unblock first navigation.
    canActivateView.next(true);
    await waitUntilStable();

    // Message box and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecViewComponent);
    expect(fixture.debugElement.parent).toShow(SpecMessageBox1Component);
  });
});

@Component({
  selector: 'spec-message-box-1',
  template: '',
})
class SpecMessageBox1Component {
}

@Component({
  selector: 'spec-message-box-2',
  template: '',
})
class SpecMessageBox2Component {
}

@Component({
  selector: 'spec-view',
  template: '',
})
class SpecViewComponent {
}
