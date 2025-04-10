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
import {styleFixture, waitUntilWorkbenchStarted, waitUntilStable} from '../../testing/testing.util';
import {provideWorkbenchForTest} from '../../testing/workbench.provider';
import {WorkbenchComponent} from '../../workbench.component';
import {expect} from '../../testing/jasmine/matcher/custom-matchers.definition';
import {WorkbenchCapabilities, WorkbenchPopupCapability, WorkbenchPopupService} from '@scion/workbench-client';
import {toShowCustomMatcher} from '../../testing/jasmine/matcher/to-show.matcher';
import {WorkbenchRouter} from '../../routing/workbench-router.service';

describe('Microfrontend Host Popup', () => {

  beforeEach(() => {
    jasmine.addMatchers(toShowCustomMatcher);
  });

  it('should allow opening multiple host popups in parallel', async () => {
    const canActivatePopup1 = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Popup,
                    qualifier: {component: 'popup-1'},
                    properties: {
                      path: 'path/to/popup/1',
                    },
                  } satisfies WorkbenchPopupCapability,
                  {
                    type: WorkbenchCapabilities.Popup,
                    qualifier: {component: 'popup-2'},
                    properties: {
                      path: 'path/to/popup/2',
                    },
                  } satisfies WorkbenchPopupCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/popup/1', canActivate: [() => firstValueFrom(canActivatePopup1)], component: SpecPopup1Component},
          {path: 'path/to/popup/2', component: SpecPopup2Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in host popup 1.
    void TestBed.inject(WorkbenchPopupService).open({component: 'popup-1'}, {anchor: {top: 0, left: 0}, closeStrategy: {onFocusLost: false}});
    await waitUntilStable();

    // Start parallel navigation in host popup 2.
    void TestBed.inject(WorkbenchPopupService).open({component: 'popup-2'}, {anchor: {top: 0, left: 0}, closeStrategy: {onFocusLost: false}});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecPopup1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecPopup2Component);

    // Unblock first navigation.
    canActivatePopup1.next(true);
    await waitUntilStable();

    // Both popups should be visible.
    expect(fixture.debugElement.parent).toShow(SpecPopup1Component);
    expect(fixture.debugElement.parent).toShow(SpecPopup2Component);
  });

  it('should allow opening a host dialog and a view in parallel', async () => {
    const canActivatePopup = new Subject<true>();

    TestBed.configureTestingModule({
      providers: [
        provideWorkbenchForTest({
          microfrontendPlatform: {
            host: {
              manifest: {
                name: 'Host',
                capabilities: [
                  {
                    type: WorkbenchCapabilities.Popup,
                    qualifier: {component: 'popup'},
                    properties: {
                      path: 'path/to/popup',
                    },
                  } satisfies WorkbenchPopupCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/popup', canActivate: [() => firstValueFrom(canActivatePopup)], component: SpecPopup1Component},
          {path: 'path/to/view', component: SpecViewComponent},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in a host popup.
    void TestBed.inject(WorkbenchPopupService).open({component: 'popup'}, {anchor: {top: 0, left: 0}, closeStrategy: {onFocusLost: false}});
    await waitUntilStable();

    // Start parallel navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecPopup1Component);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);

    // Unblock first navigation.
    canActivatePopup.next(true);
    await waitUntilStable();

    // Popup and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecPopup1Component);
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
                    type: WorkbenchCapabilities.Popup,
                    qualifier: {component: 'popup'},
                    properties: {
                      path: 'path/to/popup',
                    },
                  } satisfies WorkbenchPopupCapability,
                ],
              },
            },
            applications: [],
          },
        }),
        provideRouter([
          {path: 'path/to/view', canActivate: [() => firstValueFrom(canActivateView)], component: SpecViewComponent},
          {path: 'path/to/popup', component: SpecPopup1Component},
        ]),
      ],
    });

    const fixture = styleFixture(TestBed.createComponent(WorkbenchComponent));
    await waitUntilWorkbenchStarted();

    // Start navigation in a view.
    void TestBed.inject(WorkbenchRouter).navigate(['path/to/view']);
    await waitUntilStable();

    // Start parallel navigation in a host popup.
    void TestBed.inject(WorkbenchPopupService).open({component: 'popup'}, {anchor: {top: 0, left: 0}, closeStrategy: {onFocusLost: false}});
    await waitUntilStable();

    // First navigation should be blocked by the canActivate guard.
    expect(fixture.debugElement.parent).not.toShow(SpecViewComponent);
    // Second navigation should be blocked by the first one.
    expect(fixture.debugElement.parent).not.toShow(SpecPopup1Component);

    // Unblock first navigation.
    canActivateView.next(true);
    await waitUntilStable();

    // Popup and view components should be visible.
    expect(fixture.debugElement.parent).toShow(SpecViewComponent);
    expect(fixture.debugElement.parent).toShow(SpecPopup1Component);
  });
});

@Component({
  selector: 'spec-popup-1',
  template: '',
})
class SpecPopup1Component {
}

@Component({
  selector: 'spec-popup-2',
  template: '',
})
class SpecPopup2Component {
}

@Component({
  selector: 'spec-view',
  template: '',
})
class SpecViewComponent {
}
